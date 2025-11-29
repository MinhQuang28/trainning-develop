import { Outlet, NavLink, Link, useLoaderData } from "react-router";
import { Plus, MessageSquare, Menu } from "lucide-react"; 
import { useState } from "react";
import { prisma } from "~/utils/prisma"; 


export async function loader() {
  const DUMMY_USER_ID = "user-default-001"; 
  try {
    const dbChats = await prisma.conversation.findMany({
      where: { userId: DUMMY_USER_ID },
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
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shrink-0 relative`}
      >
        <div className="p-3">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-3 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            <Plus size={18} />
            <span className="font-medium text-sm truncate">Cuộc trò chuyện mới</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-hide">
             {dbChats.length === 0 ? (
                 <div className="px-4 py-10 text-center text-xs text-slate-600">
                    Chưa có lịch sử
                 </div>
             ) : (
                 <>
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gần đây</div>
                    {dbChats.map((chat) => (
                        <NavLink
                        key={chat.id}
                        to={`/c/${chat.id}`}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                            isActive 
                                ? "bg-blue-600 text-white font-medium" 
                                : "hover:bg-slate-800 text-slate-300"
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

      <main className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <div className="p-2 border-b border-slate-800 flex items-center gap-2 lg:hidden">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-md text-white">
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