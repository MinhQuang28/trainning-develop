import { useEffect, useRef } from "react";
import {
  useLoaderData,
  useFetcher,
  useParams,
  type ActionFunctionArgs,
  redirect,
} from "react-router";
import { prisma } from "lib/prisma";
import type { Route } from "./+types/chat.$sessionId";
import { requireUserId } from "lib/auth";
import { Ollama } from "lib/ollama";

export async function loader({ params }: Route.LoaderArgs) {
  const { sessionId } = params;
  if (sessionId === "new") return { messages: [] };
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
  return { messages };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const content = formData.get("content") as string;
  let sessionId = formData.get("sessionId") as string;

  if (!sessionId || sessionId === "new") {
    const session = await prisma.chatSession.create({
      data: {
        title: content.substring(0, 30) + " ...",
        userId: userId,
      },
    });
    sessionId = session.id;
  }
  if (!content) return { error: "No content" };

  await prisma.message.create({
    data: {
      content,
      role: "user",
      sessionId: sessionId,
    },
  });

  try {
    const ollamaData = await Ollama(content);
    const botContent = ollamaData.message?.content || "Lỗi Ollama";

    await prisma.message.create({
      data: {
        content: botContent,
        role: "assistant",
        sessionId: sessionId,
      },
    });
    return redirect(`/chat/${sessionId}`);
    
  } catch (error) {
    console.error(error);
    return { error: "Check!!!" };
  }
};

export default function ChatWindow() {
  const { messages } = useLoaderData<typeof loader>();
  const { sessionId } = useParams();
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isSending = fetcher.state === "submitting";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
        {messages.length === 0 && sessionId === "new" && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">
              Muốn gì thì nói?
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[85%] md:max-w-[75%] px-5 py-3.5 shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-tr-sm"
                  : "bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700/50"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-base">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-sm max-w-[100px] flex gap-2 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800/50 sticky bottom-0 z-20">
        <fetcher.Form
          method="post"
          ref={formRef}
          className="max-w-4xl mx-auto relative flex items-center"
        >
          <input type="hidden" name="sessionId" value={sessionId} />

          <input
            name="content"
            required
            placeholder="Nhập tin nhắn..."
            className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 shadow-lg"
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={isSending}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            title="Gửi tin nhắn"
          >
            {isSending ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </fetcher.Form>
        <div className="text-center mt-2 text-[10px] text-slate-600">
          gugugaga
        </div>
      </div>
    </>
  );
}
