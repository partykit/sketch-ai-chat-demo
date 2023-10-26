export type Message = {
  id: string;
  user: string;
  body: string;
  role: "user" | "assistant";
};

export type User = {
  name: string;
};

export function createMessage(
  user: User,
  body: string,
  role?: "user" | "assistant"
): Message {
  return {
    id: Math.random().toString(36).slice(2, 9),
    user: user.name,
    body,
    role: role || "user",
  };
}

export const rooms = [
  {
    name: "Hello, World!",
    description: "A general room",
    slug: "hello-world",
  },
  {
    name: "🎈 Party Chat",
    description: "Let’s talk about PartyKit",
    slug: "party-chat",
  },
  {
    name: "On-Page Help",
    description: "A room for every user, on every page?",
    slug: "on-page-help",
  },
  {
    name: "Room #4",
    description: "Another chatroom",
    slug: "room-4",
  },
];
