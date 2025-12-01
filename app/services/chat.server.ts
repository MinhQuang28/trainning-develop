import { prisma } from "~/utils/prisma";

const OLLAMA_API_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "gpt-oss:120b-cloud"; 

const SYSTEM_PROMPT = `
You are a helpful AI assistant.
- Answer in Vietnamese unless asked otherwise.
- Use Markdown for code blocks.
- Be concise.
`;

export async function createChatSession(prompt: string, userId: string) {
  const chatId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  const title = prompt.slice(0, 40) + "...";

  await prisma.conversation.create({
    data: {
      id: chatId,
      title,
      userId: userId 
    }
  });

  await prisma.message.create({
    data: { content: prompt, role: "USER", conversationId: chatId },
  });

  return chatId;
}

export async function streamChatResponse(chatId: string) {
  const history = await prisma.message.findMany({
    where: { conversationId: chatId },
    orderBy: { createdAt: "asc" },
  });

  const ollamaMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((msg) => ({
      role: msg.role === "USER" ? "user" : "assistant",
      content: msg.content,
    }))
  ];

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

        if (!response.body) throw new Error("Ollama failed");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(l => l.trim() !== "");
          
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
             data: { updatedAt: new Date() }
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