import OpenAI from "openai";
import { getEncoding, encodingForModel } from "js-tiktoken";

export type OpenAIMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function getChatCompletionResponse(
  env: Record<string, any>,
  messages: OpenAIMessage[],
  onTokenCallback: (token: string) => void
) {
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY as string,
    organization: env.OPENAI_API_ORGANIZATION as string,
  });

  const prompt = [
    {
      role: "system",
      content:
        "You are a helpful AI assistant. Your responses are always accurate and extremely brief.",
    } as OpenAIMessage,
    ...messages,
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: prompt,
  });

  for await (const part of stream) {
    onTokenCallback(part.choices[0]?.delta.content || "");
  }

  return null;
}
