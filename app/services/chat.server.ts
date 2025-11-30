import { prisma } from "~/utils/prisma";
import { randomUUID } from "crypto";
import { getAuthToken } from "./auth.server";

const OLLAMA_API_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "gpt-oss:20b-cloud"; 

export async function createChatSession(request: Request, prompt: string) {
  const auth = getAuthToken(request);

  const chatId =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  const title = prompt.slice(0, 40) + "...";

  const data: any = { id: chatId, title };

  if (auth.isGuest && auth.sessionId) {
    data.sessionId = auth.sessionId;
  }

  if (!auth.isGuest && auth.userId) {
    const userExists = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (userExists) {
      data.userId = auth.userId;
    } else {

      console.warn("Guest");
      data.sessionId = auth.sessionId || randomUUID();
    }
  }

  await prisma.conversation.create({ data });

  await prisma.message.create({
    data: { content: prompt, role: "USER", conversationId: chatId },
  });

  return chatId;
}

export async function streamChatResponse(chatId: string, userId?: string, sessionId?: string) {
  const history = await prisma.message.findMany({
    where: {
      conversationId: chatId,
      conversation: { userId }, 
    },
    orderBy: { createdAt: "asc" },
  });

  const ollamaMessages = history.map((msg) => ({
    role: msg.role === "USER" ? "user" : "assistant",
    content: msg.content,
  }));

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullAiResponse = "";

      try {
        const response = await fetch(OLLAMA_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: MODEL_NAME,
            messages: ollamaMessages,
            stream: true,
          }),
        });

        if (!response.body) throw new Error("Ollama connection failed");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.message?.content) {
                const content = json.message.content;
                fullAiResponse += content;
                controller.enqueue(encoder.encode(content));
              }
            } catch (e) {}
          }
        }
        if (fullAiResponse.trim()) {
          await prisma.message.create({
            data: {
              content: fullAiResponse,
              role: "ASSISTANT",
              conversationId: chatId,
            },
          });

          await prisma.conversation.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
          });
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return stream;
}
