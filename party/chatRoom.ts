import type * as Party from "partykit/server";
import { Ai } from "partykit-ai";
import { type Message, createMessage } from "../app/shared";
import { getChatCompletionResponse, type OpenAIMessage } from "./utils/openai";
import { USAGE_SINGLETON_ROOM_ID } from "./usage";
// @ts-ignore
import { EventSourceParserStream } from "eventsource-parser/stream";

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
      /*if (await this.shouldReplyWithAI()) {
        await this.replyWithOpenAI();
      }*/
      await this.replyWithLlama();
    }
  }

  async replyWithOpenAI() {
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

  async replyWithLlama() {
    // Setup
    const messages = this.messages.map((msg) => {
      return { role: msg.role, content: msg.body } as OpenAIMessage;
    });
    const aiMsg = createMessage(AI_USER, "Thinking...", "assistant");
    this.messages.push(aiMsg);

    // Run the AI
    const prompt = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Your responses are always accurate and extremely brief.",
      } as OpenAIMessage,
      ...messages,
    ];
    const stream = await this.ai.run("@cf/meta/llama-2-7b-chat-int8", {
      messages: prompt as any,
      stream: true,
    });
    const eventStream = stream
      .pipeThrough(new TextDecoderStream("utf-8"))
      .pipeThrough(new EventSourceParserStream());

    // Process the streamed response
    let response = "";
    for await (const part of eventStream) {
      if (part.data === "[DONE]") break;
      const decoded = JSON.parse(part.data);
      response += decoded.response;
      aiMsg.body = response;
      this.party.broadcast(JSON.stringify({ type: "update", message: aiMsg }));
    }
  }

  async shouldReplyWithAI() {
    const systemPromptIntro =
      "You will be shown a conversation between multiple people (all called 'user') and an AI called 'assistant'. At the end of the conversation there will be a question.";
    const systemPromptsOutro =
      "Given the conversation, should the AI reply? Reply YES if the latest message is directed at the AI (e.g. '@AI'). Also reply YES if the latest message is asking the AI to clarify its message, even if this is indirect. Response NO otherwise. Use only one of the two words YES or NO.";
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
      console.log("got result", JSON.stringify(result, null, 2));
      if (result.response === "YES") {
        return true;
      }
    } catch (err) {
      console.log("error", err);
    }

    return false;
  }
}
