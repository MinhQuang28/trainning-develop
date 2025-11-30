import ollama from "ollama";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await ollama.chat({
      model: "gpt-oss:120b-cloud",
      messages: [{ role: "user", content: prompt }],
    });

    return response.message.content || "Xin lỗi, AI không trả lời được.";
  } catch (err) {
    console.error("Ollama error:", err);
    return "Xin lỗi, AI không trả lời được lúc này.";
  }
}

export async function getAIResponseWithHistory(
  messages: Message[]
): Promise<string> {
  try {
    const response = await ollama.chat({
      model: "gpt-oss:120b-cloud",
      messages,
    });

    return response.message.content || "Xin lỗi, AI không trả lời được.";
  } catch (err) {
    console.error("Ollama error:", err);
    return "Xin lỗi, AI không trả lời được lúc này.";
  }
}