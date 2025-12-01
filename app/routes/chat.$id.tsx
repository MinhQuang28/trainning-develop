// routes/chat.$id.tsx
import {
  useLoaderData,
  type LoaderFunction,
  useFetcher,
} from "react-router";
import  prisma  from "../lib/db";
import { useRef, useState, useEffect } from "react";


// Kiểu Message chuẩn
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const TEMP_USER_ID = 1;

export const loader: LoaderFunction = async ({ params }) => {
  const conversationId = Number(params.id);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation || conversation.userId !== TEMP_USER_ID) {
    throw new Response("Not Found", { status: 404 });
  }

  return conversation;
};

export default function ChatRoute() {
  const conversation = useLoaderData() as any;
  const fetcher = useFetcher();

  // Khai báo kiểu rõ ràng → hết lỗi prev any
  const [messages, setMessages] = useState<Message[]>(
    conversation.messages.map((m: any): Message => ({
      id: m.id.toString(),
      content: m.content,
      role: m.role,
      timestamp: new Date(m.createdAt),
    }))
  );

  const [input, setInput] = useState("");
  //const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const isTyping = fetcher.state !== "idle";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lắng nghe kết quả từ fetcher
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.assistant) {
        const aiMessage: Message = {
          id: fetcher.data.assistant.id.toString(),
          content: fetcher.data.assistant.content,
          role: "assistant",
          timestamp: new Date(fetcher.data.assistant.createdAt),
        };
        setMessages(prev => [...prev, aiMessage]);
      }

      // xu ly loi 
      if (fetcher.data.error) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `Lỗi: ${fetcher.data.error}. Vui lòng thử lại.`,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  }, [fetcher.state, fetcher.data]);

    const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
        id: Date.now().toString(),
        content: input.trim(),
        role: "user",
        timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const textToSend = input.trim();
    setInput("");

    const token = localStorage.getItem("token");
    console.log("bi chan o dau")

    fetcher.submit(
      {
        conversationId: conversation.id,
        message: textToSend,
        token: token || "",
      },
      {
        method: "POST",
        action: "/api/messages",
        encType: "application/json",
      }
    );
    };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tin nhắn */}
      <div className="flex-1 overflow-y-auto space-y-8 py-8 px-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-4 max-w-3xl ${isUser ? "flex-row-reverse" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold
                  ${isUser ? "bg-purple-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"}
                `}>
                  {isUser ? "U" : "AI"}
                </div>
                <div className={`px-5 py-3 rounded-2xl shadow-md max-w-xl
                  ${isUser
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none"
                    : "bg-gray-800 text-gray-100 rounded-tl-none"
                  }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold">
                AI
              </div>
              <div className="bg-gray-800 px-5 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                ref={textareaRef}
                placeholder="Nhập tin nhắn..."
                rows={1}
                required
                onKeyDown={handleKeyPress}
                disabled={isTyping}
                className="flex-1 px-5 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden disabled:opacity-60"
                style={{ minHeight: "52px" }}
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
              >
                {isTyping ? "Đang suy nghĩ..." : "Gửi"}
              </button>
            </div>
          </form>
          <p className="text-center text-xs text-gray-500 mt-3">
            ChatAI có thể tạo ra thông tin sai. Hãy kiểm chứng lại.
          </p>
        </div>
      </div>
    </div>
  );
}