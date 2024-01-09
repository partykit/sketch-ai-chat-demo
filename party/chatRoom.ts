import type * as Party from "partykit/server";
import { Ai } from "partykit-ai";
import { type Message, createMessage } from "../app/shared";
import { getChatCompletionResponse, type OpenAIMessage } from "./utils/openai";
import { USAGE_SINGLETON_ROOM_ID } from "./usage";

const AI_USER = { name: "AI" };

export default class ChatServer implements Party.Server {
  messages: Message[] = [];
  ai: Ai;

  constructor(public party: Party.Party) {
    this.party = party;
    this.messages = [];
    this.ai = new Ai(party.context.ai);
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
      if (await this.shouldReplyWithAI()) {
        await this.replyWithAI();
      }
    }
  }

  async replyWithAI() {
    const messages = this.messages.map((msg) => {
      return { role: msg.role, content: msg.body } as OpenAIMessage;
    });
    const aiMsg = createMessage(AI_USER, "Thinking...", "assistant");
    this.messages.push(aiMsg);

    let text = "";
    const tokens = await getChatCompletionResponse(
      this.party.env,
      messages,
      (token) => {
        text += token;
        aiMsg.body = text;
        this.party.broadcast(
          JSON.stringify({ type: "update", message: aiMsg })
        );
      }
    );
    // Report usage to the usage server
    this.party.context.parties.usage.get(USAGE_SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({ usage: tokens }),
    });
  }

  async shouldReplyWithAI() {
    const systemPromptIntro =
      "You will be shown a conversation between multiple people (all called 'user') and an AI called 'assistant'. At the end of the conversation there will be a question.";
    const systemPromptsOutro =
      "Given the conversation, should the AI reply? Take into account whether it is being addressed directly (e.g. '@AI'), is part of an existing chat, or can usefully interject. Response with YES or NO. The AI wants to be responsive and polite. Use only one of those two words.";
    const conversation = this.messages.map((msg) => {
      return { role: msg.role, content: msg.body } as OpenAIMessage;
    });
    const messages = [
      { role: "system", content: systemPromptIntro },
      ...conversation,
      { role: "system", content: systemPromptsOutro },
    ];
    try {
      const result = await this.ai.run("@cf/meta/llama-2-7b-chat-int8", {
        messages: messages as any,
        stream: false,
      });
      //console.log("got result", JSON.stringify(result, null, 2));
      if (result.response === "YES") {
        return true;
      }
    } catch (err) {
      console.log("error", err);
    }

    return false;
  }
}
