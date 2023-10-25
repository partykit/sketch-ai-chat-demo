import type * as Party from "partykit/server";
import { type Message, createMessage } from "../app/shared";
import { getChatCompletionResponse, type OpenAIMessage } from "./utils/openai";

const AI_USER = { name: "AI" };

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
      await this.replyWithAI();
    }
  }

  async replyWithAI() {
    const messages = this.messages.map((msg) => {
      return { role: msg.role, content: msg.body } as OpenAIMessage;
    });
    const aiMsg = createMessage(AI_USER, "Thinking...", "assistant");
    this.messages.push(aiMsg);

    let text = "";
    await getChatCompletionResponse(this.party.env, messages, (token) => {
      text += token;
      aiMsg.body = text;
      this.party.broadcast(JSON.stringify({ type: "update", message: aiMsg }));
    });
  }
}
