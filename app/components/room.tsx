import { useState, useRef, useEffect } from "react";
import { useUser } from "~/providers/user-context";
import type { Message } from "~/shared";
import AddMessageForm from "./add-message-form";
import Messages from "./messages";
import usePartySocket from "partysocket/react";

export default function Room(props: { host: string; roomName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useUser();

  const handleUpdate = (prevMessages: Message[], message: Message) => {
    // If message.id is already in prevMessages, replace it
    // If not, add it to the end
    const index = prevMessages.findIndex((m) => m.id === message.id);
    if (index >= 0) {
      return [
        ...prevMessages.slice(0, index),
        message,
        ...prevMessages.slice(index + 1),
      ];
    }

    return [...prevMessages, message];
  };

  const socket = usePartySocket({
    host: props.host,
    party: "chatRoom",
    room: props.roomName,
    onMessage(evt) {
      const data = JSON.parse(evt.data);
      if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "update") {
        setMessages((prevMessages) => handleUpdate(prevMessages, data.message));
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
