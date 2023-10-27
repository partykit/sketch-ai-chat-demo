/*
TODO:

- track cursor position only within a provided element
- use msgpack
- provide a default room name from the href
*/

import { useState, useEffect, createContext, useContext } from "react";
import usePartySocket from "partysocket/react";
import {
  type Info,
  type Presence,
  type User,
  type ClientMessage,
  type PartyMessage,
  decodeMessage,
  encodeClientMessage,
  partyMessageSchema,
} from "party/presence-schema";

type UserMap = Map<string, User>;

interface PresenceContextType {
  myId: string | null;
  otherUsers: Map<string, User>;
  myself: User | null;
  updatePresence: (partial: Partial<Presence>) => void;
}

export const PresenceContext = createContext<PresenceContextType>({
  myId: null,
  otherUsers: {} as Map<string, User>,
  myself: null,
  updatePresence: () => {},
});

export function usePresence() {
  return useContext(PresenceContext);
}

export default function PresenceContextProvider(props: {
  host: string;
  room: string;
  presence: Presence; // current user's initial presence
  info: Info; // current user's initial info
  children: React.ReactNode;
}) {
  // Internally we store users as a map of id => User for ease of updates
  const [users, setUsers] = useState<UserMap>(new Map());

  // Pending presence update: used to update optimisticMyself and also send to the server
  const [pendingUpdate, setPendingUpdate] = useState<Partial<Presence> | null>(
    null
  );

  // To be exposed by the context
  const [myId, setMyId] = useState<string | null>(null);
  const [otherUsers, setOtherUsers] = useState<UserMap>(new Map());
  // myself is optimistic: we update it locally, and then send the update to the server.
  // Incoming updates from the server replace this optimisatic value
  const [myself, setMyself] = useState<User>({
    country: null,
    info: props.info,
    presence: props.presence,
  });

  const updateUsers = (prevUsers: UserMap, message: PartyMessage) => {
    const users = new Map(prevUsers);
    if (message.type !== "changes") return prevUsers;
    // Add new users
    if (message.add) {
      for (const [id, user] of Object.entries(message.add)) {
        users.set(id, user);
      }
    }
    // Iterate over presence changes and update users, if any. Ignore non-existent users.
    if (message.presence) {
      for (const [id, presence] of Object.entries(message.presence)) {
        const user = users.get(id);
        if (user) {
          users.set(id, {
            ...user,
            presence,
          });
        }
      }
    }
    // Remove users, if any. Ignore non-existent users.
    if (message.remove) {
      for (const id of message.remove) {
        users.delete(id);
      }
    }
    return users;
  };

  // whenever users is updated by the server, update otherUsers and myself
  useEffect(() => {
    if (!myId) return;
    let otherUsers = new Map<string, User>();
    users.forEach((user, id) => {
      if (id === myId) return;
      otherUsers.set(id, user);
    });
    setOtherUsers(otherUsers);
    setMyself(myself);
  }, [myId, users]);

  const handleMessage = async (event: MessageEvent) => {
    //const message = JSON.parse(event.data) as PartyMessage;
    const data =
      event.data instanceof Blob
        ? // byte array -> msgpack
          decodeMessage(await event.data.arrayBuffer())
        : // string -> json
          JSON.parse(event.data);

    const result = partyMessageSchema.safeParse(data);
    if (!result.success) return;
    const message = result.data;

    switch (message.type) {
      case "sync":
        // create Map from message.users (which is id -> User)
        setUsers(new Map<string, User>(Object.entries(message.users)));
        break;
      case "changes":
        setUsers((prevUsers) => updateUsers(prevUsers, message));
        break;
    }
  };

  const socket = usePartySocket({
    host: props.host,
    party: "presence",
    room: props.room,
    onMessage: (event) => handleMessage(event),
  });

  // Send "join" message when the socket connects
  useEffect(() => {
    if (socket) {
      setMyId(socket.id);
      const message: ClientMessage = {
        type: "join",
        presence: props.presence,
        info: props.info,
      };
      socket.send(encodeClientMessage(message));
    }
  }, [socket]);

  useEffect(() => {
    if (!pendingUpdate) return;

    // pendingUpdate is a partial presence object. We send entire presence objects
    // to the server, so we need to merge it with the existing (optimistic) object
    const presence = {
      ...myself?.presence,
      ...pendingUpdate,
    } as Presence;

    // Update the optimistic value
    setMyself(
      (prevMyself) =>
        ({
          ...prevMyself,
          presence,
        } as User)
    );
    setPendingUpdate(null);

    // Now send to the server
    if (!socket) return;
    const message: ClientMessage = { type: "update", presence };
    socket.send(encodeClientMessage(message));
  }, [socket, pendingUpdate]);

  return (
    <PresenceContext.Provider
      value={{ myId, otherUsers, myself, updatePresence: setPendingUpdate }}
    >
      {props.children}
    </PresenceContext.Provider>
  );
}
