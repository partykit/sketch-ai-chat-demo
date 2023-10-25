import { useState, useRef, useEffect } from "react";
import { useUser } from "~/providers/user-context";
import type { Message } from "~/types";
import AddMessageForm from "./add-message-form";

export default function Room(props: { roomName: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for window resizes
  useEffect(() => {
    window.addEventListener("resize", scrollToBottom);
    return () => window.removeEventListener("resize", scrollToBottom);
  }, []);

  const addMessage = (message: Message) => {
    setMessages((messages) => [...messages, message]);
  };

  return (
    <div className="grow flex flex-col justify-between items-start">
      <div className="grow w-full basis-full relative overflow-y-scroll">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="flex flex-col gap-3 w-full">
            {messages.map((message, i) => {
              const extraClasses =
                message.user === "me" ? "flex-row-reverse" : "";
              return (
                <div
                  key={i}
                  className={`flex justify-start items-center gap-2 ${extraClasses}`}
                >
                  <div className="font-semibold">{message.user}</div>
                  <div className="rounded-lg bg-stone-200 px-2 py-1">
                    {message.body}
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} className="h-2"></div>
        </div>
      </div>
      <div className="mt-auto w-full">
        <AddMessageForm addMessage={addMessage} user={user} />
      </div>
    </div>
  );
}
