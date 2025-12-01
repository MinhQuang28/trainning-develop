import { Outlet, NavLink, Link, useLoaderData, Form } from "react-router"; 
import { Plus, MessageSquare, Menu, LogOut, User as UserIcon } from "lucide-react"; 
import { useState } from "react";
import { prisma } from "~/utils/prisma";
import { requireUserId } from "~/services/session.server"; 

export async function loader({ request }: any) {
  const userId = await requireUserId(request); 

  const dbChats = await prisma.conversation.findMany({
    where: { userId: userId }, 
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true }
  });

  const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { name: true, auth: { select: { email: true } } }
  });

  return { dbChats, user };
}

export default function AppLayout() {
  const { dbChats, user } = useLoaderData<typeof loader>();
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

        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.auth?.email}</p>
                </div>
            </div>
            
            <Form method="post" action="/logout">
                <button type="submit" className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors text-sm">
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                </button>
            </Form>
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