export type Message = {
  id: string;
  user: string;
  body: string;
};

export type User = {
  name: string;
};

export function createMessage(user: User, body: string): Message {
  return { id: Math.random().toString(36).slice(2, 9), user: user.name, body };
}