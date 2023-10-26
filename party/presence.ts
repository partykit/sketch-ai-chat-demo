import type * as Party from "partykit/server";
import type {
  Info,
  Presence,
  User,
  ClientMessage,
  PartyMessage,
} from "./presence-schema";
import {
  clientMessageSchema,
  decodeMessage,
  encodePartyMessage,
} from "./presence-schema";

export type ConnectionWithUser = Party.Connection<{
  country?: string | null;
  info?: Info;
  presence?: Presence;
}>;

const BROADCAST_INTERVAL = 1000 / 60; // 60fps

// server.ts
export default class PresenceServer implements Party.Server {
  constructor(public party: Party.Party) {}
  options: Party.ServerOptions = {
    hibernate: true,
  };

  // pending updates are stored in memory and sent every tick
  add: { [id: string]: User } = {};
  presence: { [id: string]: Presence } = {};
  remove: string[] = [];

  lastBroadcast = 0;
  interval: ReturnType<typeof setInterval> | null = null;

  onConnect(
    connection: Party.Connection,
    { request }: Party.ConnectionContext
  ): void | Promise<void> {
    const country = request.cf?.country ?? null;

    // Stash the country on the websocket
    connection.setState({ country });

    //console.log("onConnect", this.party.id, connection.id, country);
  }

  enqueueAdd(id: string, user: User) {
    this.add[id] = user;
  }

  enqueuePresence(id: string, presence: Presence) {
    this.presence[id] = presence;
  }

  enqueueRemove(id: string) {
    this.remove.push(id);
    delete this.presence[id];
  }

  getUser(connection: ConnectionWithUser): User {
    return {
      country: connection.state?.country ?? null,
      presence: connection.state?.presence,
      info: connection.state?.info,
    };
  }

  onMessage(
    msg: string | ArrayBufferLike,
    connection: ConnectionWithUser
  ): void | Promise<void> {
    //const message = JSON.parse(msg as string) as ClientMessage;
    const result = clientMessageSchema.safeParse(decodeMessage(msg));
    if (!result.success) return;
    const message = result.data;
    /*console.log(
      "onMessage",
      this.party.id,
      connection.id,
      JSON.stringify(message, null, 2)
    );*/
    switch (message.type) {
      case "join": {
        // Keep the presence and info on the websocket
        connection.setState((prevState) => ({
          ...prevState,
          presence: message.presence,
          info: message.info,
        }));
        this.enqueueAdd(connection.id, this.getUser(connection));
        // Reply with the current presence of all connections, including self
        const sync = <PartyMessage>{
          type: "sync",
          users: [...this.party.getConnections()].reduce(
            (acc, user) => ({ ...acc, [user.id]: this.getUser(user) }),
            {}
          ),
        };
        //connection.send(JSON.stringify(sync));
        connection.send(encodePartyMessage(sync));
        break;
      }
      case "update": {
        // A presence update
        connection.setState((prevState) => ({
          ...prevState,
          presence: message.presence,
        }));
        this.enqueuePresence(connection.id, message.presence);
        break;
      }
      default: {
        return;
      }
    }

    this.broadcast(); // don't await
  }

  onClose(connection: ConnectionWithUser): void | Promise<void> {
    this.enqueueRemove(connection.id);
    this.broadcast();
  }

  async broadcast() {
    // Broadcasts deltas. Looks at lastBroadcast
    // - If it's longer ago than BROADCAST_INTERVAL, broadcasts immediately
    // - If it's less than BROADCAST_INTERVAL ago, schedules an alarm
    //   to broadcast later
    const now = Date.now();
    const ago = now - this.lastBroadcast;
    if (ago >= BROADCAST_INTERVAL) {
      this._broadcast();
    } else {
      if (!this.interval) {
        this.interval = setInterval(() => {
          this._broadcast();
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
          }
        }, BROADCAST_INTERVAL - ago);
      }
    }
  }

  _broadcast() {
    this.lastBroadcast = Date.now();

    // Avoid the situation where there's only one connection and we're
    // rebroadcasting its own deltas to it
    const connections = [...this.party.getConnections()];
    const presenceUniqueIds = new Set(Object.keys(this.presence));
    if (
      connections.length === 1 &&
      this.remove.length === 0 &&
      Object.keys(this.add).length === 0 &&
      presenceUniqueIds.size === 1 &&
      presenceUniqueIds.has(connections[0].id)
    ) {
      this.presence = {};
      return;
    }

    const update = <PartyMessage>{
      type: "changes",
      add: this.add,
      presence: this.presence,
      remove: this.remove,
    };
    //this.party.broadcast(JSON.stringify(update));
    this.party.broadcast(encodePartyMessage(update));
    this.add = {};
    this.presence = {};
    this.remove = [];
  }
}

PresenceServer satisfies Party.Worker;
