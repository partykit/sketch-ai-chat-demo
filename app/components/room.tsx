import { useState, useRef, useEffect } from "react";
import { useUser } from "~/providers/user-context";
import type { Message } from "~/shared";
import AddMessageForm from "./add-message-form";
import Messages from "./messages";

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

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <div className="grow flex flex-col justify-between items-start">
      <Messages user={user} messages={messages} />
      <AddMessageForm addMessage={addMessage} user={user} />
    </div>
  );
}
