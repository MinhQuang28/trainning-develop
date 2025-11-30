import { handleMessage } from "../services/chat.server";
import type { ActionFunction } from "react-router";


export async function loader() {
  return Response.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}

export const action: ActionFunction = async ({ request }) => {
  console.log("📨 API /api/messages - action được gọi");
  
  try {
    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return Response.json(
        { error: "Missing conversationId or message" },
        { status: 400 }
      );
    }

    const result = await handleMessage(Number(conversationId), message);
    console.log("✅ Result:", result);

    return Response.json(result);
    
  } catch (error: any) {
    console.error("❌ API error:", error);
    
    return Response.json(
      { 
        error: error.message || "Lỗi server",
        details: error.stack 
      },
      { status: 500 }
    );
  }
};