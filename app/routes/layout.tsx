// routes/layout.tsx
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useLocation,
  type LoaderFunction,
} from "react-router";
import  prisma  from "../lib/db"; // ← ĐÚNG ĐƯỜNG DẪN
import { MessageSquare, Plus, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

// Đúng cách khai báo loader với TypeScript 5.5+ + verbatimModuleSyntax
export const loader: LoaderFunction = async () => {
  const TEMP_USER_ID = 1;

  const conversations = await prisma.conversation.findMany({
    where: { userId: TEMP_USER_ID },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  return conversations;
};

export default function Layout() {
  const conversations = useLoaderData() as Array<{
    id: number;
    title: string;
  }>;

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Xác định chat hiện tại để highlight
  const currentChatId = location.pathname.startsWith("/chat/")
    ? Number(location.pathname.split("/chat/")[1])
    : null;

  // Tự động mở sidebar trên desktop
  useEffect(() => {
    if (currentChatId && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, [currentChatId]);

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-0 md:w-64"
        } transition-all duration-300 bg-gray-900 flex flex-col overflow-hidden border-r border-gray-800`}
      >
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus size={18} />
            New chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              Chưa có cuộc trò chuyện nào
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/chat/${c.id}`)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left group ${
                  currentChatId === c.id ? "bg-gray-800 ring-1 ring-gray-700" : ""
                }`}
              >
                <MessageSquare size={18} className="text-gray-400 flex-shrink-0" />
                <span className="truncate text-sm flex-1">{c.title}</span>
              </button>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-sm font-bold">
              U
            </div>
            <span className="text-sm font-medium">User</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-300"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-semibold">ChatAI</h1>
        </header>

        {/* Nội dung chính */}
        <div className="flex-1 overflow-hidden bg-gray-950">
          <Outlet />
        </div>
      </main>
    </div>
  );
}