import {
  Link,
  Outlet,
  useLoaderData,
  NavLink,
  type ActionFunctionArgs,
  Form,
} from "react-router";
import { prisma } from "lib/prisma";
import { requireUserId } from "lib/auth";
import { redirect } from "react-router";

export async function loader({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return { sessions };
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "logout") {
    return redirect("/auth", {
      headers: {
        "Set-Cookie": "userSession=; Max-Age=0; Path=/;",
      },
    });
  }
  return null;
}

export default function Chat() {
  const { sessions } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shadow-xl z-10">
        {/* Header Sidebar */}
        <div className="p-4 pb-2">
          <Link
            to="/chat/new"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 font-medium"
          >
            <span className="text-xl">+</span> Cuộc trò chuyện mới
          </Link>
        </div>

        {/* Danh sách Sessions */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            Gần đây
          </div>
          {sessions.map((s) => (
            <NavLink
              key={s.id}
              to={`/chat/${s.id}`}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-sm transition-colors truncate ${
                  isActive
                    ? "bg-slate-800/80 text-white border-l-4 border-blue-500"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`
              }
            >
              {s.title}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Form method="post" action="/logout">
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Đăng xuất
            </button>
          </Form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative bg-slate-900">
        <Outlet />
      </div>
    </div>
  );
}
