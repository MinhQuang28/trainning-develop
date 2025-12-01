import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, StopCircle } from "lucide-react";
import { 
  useLoaderData, useParams, useRevalidator, 
  type LoaderFunctionArgs, type ActionFunctionArgs 
} from "react-router"; 
import { prisma } from "~/utils/prisma";
import { streamChatResponse } from "~/services/chat.server";
import { requireUserId } from "~/services/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request); 
  const { chatId } = params;
  if (!chatId) return { history: [] }; 

  const conversation = await prisma.conversation.findUnique({
      where: { id: chatId },
      select: { userId: true }
  });

  if (!conversation || conversation.userId !== userId) {
      throw new Response("Forbidden", { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: chatId },
    orderBy: { createdAt: "asc" },
  });

  return { 
    history: messages.map(msg => ({
      role: msg.role === "USER" ? "user" : "assistant",
      content: msg.content
    }))
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
      const userId = await requireUserId(request);
      const chatId = params.chatId;
      if (!chatId) throw new Error("No Chat ID");
      
      const conversation = await prisma.conversation.findFirst({
          where: { id: chatId, userId }
      });
      if(!conversation) throw new Error("Unauthorized");

      const formData = await request.formData();
      const prompt = formData.get("prompt") as string;
      
      if (prompt) {
          await prisma.message.create({
              data: { content: prompt, role: "USER", conversationId: chatId }
          });
      }

      const stream = await streamChatResponse(chatId);
      return new Response(stream, { headers: { "Content-Type": "text/plain" } });
  } catch (e: any) {
      return new Response(`Server Error: ${e.message}`, { status: 500 });
  }
}

export default function ChatRoute() {
  const { chatId } = useParams(); 
  const { history } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  const [messages, setMessages] = useState(history);
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState("");
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredAutoRun = useRef(false); 

  useEffect(() => {
    if (!isGenerating) setMessages(history);
  }, [history, isGenerating]);

  const runStream = async (promptToSend: string | null) => {
    if (isGenerating) return;
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    if (promptToSend) setMessages(prev => [...prev, { role: "user", content: promptToSend }]);
    setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content === '') return prev;
        return [...prev, { role: "assistant", content: "" }];
    });

    try {
      const formData = new FormData();
      if (promptToSend) formData.append("prompt", promptToSend);

      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (response.headers.get("content-type")?.includes("text/html")) throw new Error("Server Error HTML");
      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      if (promptToSend) revalidator.revalidate();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
            const h = [...prev];
            if (h[h.length-1]?.role === 'assistant') h[h.length-1].content += textChunk;
            return h;
        });
      }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
             setMessages(prev => {
                const h = [...prev];
                if (h[h.length-1]?.role === 'assistant') h[h.length-1].content = `**Lỗi:** ${error.message}`;
                return h;
             });
        }
    } finally {
        setIsGenerating(false);
        hasTriggeredAutoRun.current = false; 
        if (!abortControllerRef.current?.signal.aborted) revalidator.revalidate();
    }
  };

  useEffect(() => {
     if (history.length > 0 && !isGenerating) {
         const lastMsg = history[history.length - 1];
         if (lastMsg.role === 'user' && !hasTriggeredAutoRun.current) {
             hasTriggeredAutoRun.current = true;
             runStream(null);
         }
     }
  }, [history.length, chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === "user" ? "bg-blue-600" : "bg-emerald-600"}`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-slate-800 text-slate-100 rounded-tr-none" : "bg-transparent text-slate-200"}`}>
              <div className="prose prose-invert prose-sm max-w-none break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isGenerating && messages[messages.length-1]?.role === 'user' && <div className="text-slate-500 text-sm ml-12">Đang suy nghĩ...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 z-10">
        <form onSubmit={(e) => { e.preventDefault(); runStream(input); setInput(""); }} className="relative max-w-3xl mx-auto">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." disabled={isGenerating}
            className="w-full py-4 pl-6 pr-14 bg-slate-800 text-white rounded-full border border-slate-700 focus:border-blue-500 outline-none shadow-lg" />
          {isGenerating ? (
            <button type="button" onClick={() => abortControllerRef.current?.abort()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-400 hover:text-red-500"><StopCircle size={20} /></button>
          ) : (
            <button type="submit" disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50"><Send size={20} /></button>
          )}
        </form>
      </div>
    </div>
  );
}