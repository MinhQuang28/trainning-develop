import { Outlet, NavLink, Link, useLoaderData } from "react-router";
import { Plus, MessageSquare, Menu } from "lucide-react"; 
import { useState } from "react";
import { getAuthToken } from "~/services/auth.server";
import { prisma } from "~/utils/prisma"; 

export async function loader({ request }:any) {
  const auth = getAuthToken(request);

  if (auth.isGuest || !auth.userId) {
    return { dbChats: [] };
  }

  try {
    const dbChats = await prisma.conversation.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true }
    });
    return { dbChats };
  } catch (error) {
    return { dbChats: [] };
  }
}
export default function AppLayout() {
  const { dbChats } = useLoaderData<typeof loader>();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } bg-white text-slate-900 flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200 shrink-0 relative`}
      >
        <div className="p-3">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-3 py-3 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer font-medium"
          >
            <Plus size={18} />
            <span className="truncate text-sm">Cuộc trò chuyện mới</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-hide">
             {dbChats.length === 0 ? (
                 <div className="px-4 py-10 text-center text-xs text-gray-400">
                    Chưa có lịch sử
                 </div>
             ) : (
                 <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gần đây</div>
                    {dbChats.map((chat) => (
                        <NavLink
                        key={chat.id}
                        to={`/c/${chat.id}`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                            isActive 
                                ? "bg-blue-600 text-white font-medium" 
                                : "hover:bg-blue-50 text-slate-900"
                            }`
                        }
                        >
                        <MessageSquare size={16} />
                        <span className="truncate">{chat.title}</span>
                        </NavLink>
                    ))}
                 </>
             )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="p-2 border-b border-gray-200 flex items-center gap-2 lg:hidden">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-blue-50 rounded-md text-blue-600">
                <Menu size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
