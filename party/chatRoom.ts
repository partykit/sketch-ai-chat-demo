import type * as Party from "partykit/server";
import { type Message } from "../app/shared";

export default class ChatServer implements Party.Server {
  messages: Message[] = [];

  constructor(public party: Party.Party) {
    this.party = party;
    this.messages = [];
  }

  onConnect(connection: Party.Connection) {
    connection.send(
      JSON.stringify({ type: "history", messages: this.messages })
    );
  }

  async onMessage(messageString: string, connection: Party.Connection) {
    const msg = JSON.parse(messageString);
    if (msg.type === "message") {
      this.messages.push(msg.message);
      this.party.broadcast(
        JSON.stringify({ type: "update", message: msg.message }),
        [connection.id]
      );
    }
  }
}
