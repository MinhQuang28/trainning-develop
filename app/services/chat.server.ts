// app/services/chat.server.ts
import prisma from "../lib/db";
import { getAIResponseWithHistory } from "../lib/ollama";

const TEMP_USER_ID = 1;

async function addMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string
) {
  return await prisma.message.create({
    data: {
      content,
      role,
      userId: TEMP_USER_ID,
      conversationId,
    },
  });
}

async function getMessageHistory(conversationId: number) {
  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });
}

async function updateConversationTitle(conversationId: number, firstMessage: string) {
  const totalMessages = await prisma.message.count({ where: { conversationId } });
  
  if (totalMessages === 2) { 
    const shortTitle = firstMessage.length > 40 
      ? firstMessage.slice(0, 40) + "..." 
      : firstMessage;
      
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: shortTitle },
    });
  }
}


export async function handleMessage(
  conversationId: number,
  userContent: string,
  userId: number // thêm userId
) {
  const content = userContent.trim();
  if (!content) throw new Error("Tin nhắn rỗng");

  console.log("🔧 handleMessage bắt đầu:", { conversationId, userContent, userId });

  // 🔹 Kiểm tra conversation có thuộc user không
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conversation) throw new Error("Conversation không tồn tại hoặc không thuộc user");

  console.log("💾 Lưu tin nhắn user...");
  const userMessage = await addMessage(conversationId, "user", content);

  console.log("📜 Lấy lịch sử tin nhắn...");
  const history = await getMessageHistory(conversationId);
  console.log(`✅ Đã lấy ${history.length} tin nhắn`);

  const messagesForAI = [
    {
      role: "system" as const,
      content: "Bạn là trợ lý AI thông minh, trả lời bằng tiếng Việt, thân thiện và chính xác.",
    },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  let assistantMessage;

  try {
    console.log("🤖 Gọi AI...");
    const aiContent = await getAIResponseWithHistory(messagesForAI);
    assistantMessage = await addMessage(conversationId, "assistant", aiContent);

  } catch (error) {
    console.error("❌ Lỗi khi gọi AI:", error);
    assistantMessage = await addMessage(
      conversationId,
      "assistant",
      "Xin lỗi, AI hiện không phản hồi được."
    );
  }

  await updateConversationTitle(conversationId, content);

  return {
    user: userMessage,
    assistant: assistantMessage,
  };
}
