import { useState, useRef, useEffect } from "react";
import { useUser } from "~/providers/user-context";
import type { Message } from "~/shared";
import AddMessageForm from "./add-message-form";
import Messages from "./messages";
import usePartySocket from "partysocket/react";

export default function Room(props: { host: string; roomName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useUser();

  const socket = usePartySocket({
    host: props.host,
    party: "chatRoom",
    room: props.roomName,
    onMessage(evt) {
      const data = JSON.parse(evt.data);
      if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "update") {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    },
  });

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    socket.send(JSON.stringify({ type: "message", message }));
  };

  return (
    <div className="grow flex flex-col justify-between items-start">
      <Messages user={user} messages={messages} />
      <AddMessageForm addMessage={addMessage} user={user} />
    </div>
  );
}
