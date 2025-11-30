import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react"; 
import { Form, redirect, useNavigation, useLoaderData, useActionData } from "react-router"; 
import type { ActionFunctionArgs, LoaderFunction } from "react-router";
import { createChatSession } from "~/services/chat.server";
import { getAuthToken, login, register } from "~/services/auth.server";
import { prisma } from "~/utils/prisma";

export const loader: LoaderFunction = async ({ request }) => {
  const auth = getAuthToken(request);

  let userName = "User"; 
  if (!auth.isGuest && auth.userId) {
    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (user) userName = user.name;
  }

  return { userName, isGuest: auth.isGuest };
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const prompt = formData.get("prompt") as string;
  if (prompt && prompt.trim()) {
    const chatId = await createChatSession(request, prompt);
    return redirect(`/c/${chatId}`);
  }

  const loginEmail = formData.get("loginEmail") as string;
  const loginPassword = formData.get("loginPassword") as string;
  if (loginEmail && loginPassword) {
    try {
      const token = await login(loginEmail, loginPassword);
      return new Response(null, {
        status: 302,
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
          Location: "/", 
        },
      });
    } catch (err: any) {
      return { error: err.message || "Đăng nhập thất bại", form: "login" };
    }
  }

  const regName = formData.get("regName") as string;
  const regEmail = formData.get("regEmail") as string;
  const regPassword = formData.get("regPassword") as string;
  if (regName && regEmail && regPassword) {
    try {
      const token = await register({ name: regName, email: regEmail, password: regPassword });
      return new Response(null, {
        status: 302,
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
          Location: "/", 
        },
      });
    } catch (err: any) {
      return { error: err.message || "Đăng ký thất bại", form: "register" };
    }
  }

  return null;
}

export default function Home() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { userName, isGuest } = useLoaderData<{ userName: string; isGuest: boolean }>();
  const actionData = useActionData<{ error?: string; form?: "login" | "register" }>();

  const [activeForm, setActiveForm] = useState<"login" | "register" | null>(
    actionData?.form || null
  );

  return (

    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in relative bg-white">
    {isGuest && !activeForm && (
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          onClick={() => setActiveForm("login")}
        >
          Đăng nhập
        </button>
        <button
          className="bg-white text-black border border-blue-600 px-4 py-2 rounded hover:bg-blue-100"
          onClick={() => setActiveForm("register")}
        >
          Đăng ký
        </button>
      </div>
    )}

    {isGuest && activeForm === "login" && (
      <div className="absolute top-4 right-4 z-50">
        <Form method="post" className="flex flex-col gap-2 bg-white p-4 rounded shadow-md w-60">
          <h2 className="text-lg font-semibold mb-2 text-black">Đăng nhập</h2>
          <input type="email" name="loginEmail" placeholder="Email" className="p-2 rounded border border-slate-300 text-black" required />
          <input type="password" name="loginPassword" placeholder="Mật khẩu" className="p-2 rounded border border-slate-300 text-black" required />
          {actionData?.form === "login" && actionData?.error && (
            <p className="text-red-500 text-sm">{actionData.error}</p>
          )}
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500 mt-2" disabled={isSubmitting}>Đăng nhập</button>
        </Form>
        <button
          className="absolute top-0 right-0 text-black text-xl font-bold"
          onClick={() => setActiveForm(null)}
        >
          ×
        </button>
      </div>
    )}

    {isGuest && activeForm === "register" && (
      <div className="absolute top-4 right-4 z-50">
        <Form method="post" className="flex flex-col gap-2 bg-white p-4 rounded shadow-md w-60">
          <h2 className="text-lg font-semibold mb-2 text-black">Đăng ký</h2>
          <input type="text" name="regName" placeholder="Họ và tên" className="p-2 rounded border border-slate-300 text-black" required />
          <input type="email" name="regEmail" placeholder="Email" className="p-2 rounded border border-slate-300 text-black" required />
          <input type="password" name="regPassword" placeholder="Mật khẩu" className="p-2 rounded border border-slate-300 text-black" required />
          {actionData?.form === "register" && actionData?.error && (
            <p className="text-red-500 text-sm">{actionData.error}</p>
          )}
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500 mt-2" disabled={isSubmitting}>Đăng ký</button>
        </Form>
        <button
          className="absolute top-0 right-0 text-black text-xl font-bold"
          onClick={() => setActiveForm(null)}
        >
          ×
        </button>
      </div>
    )}

      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg shadow-blue-200/50 mb-4">
            <Sparkles className="text-white w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 pb-1">
          Xin chào, {userName}
        </h1>
        <p className="text-xl text-slate-700">Tôi có thể giúp gì cho bạn hôm nay?</p>
      </div>
      <Form method="post" className="w-full max-w-2xl relative group">
          <input
            type="text"
            name="prompt"
            placeholder="Nhập câu hỏi của bạn..."
            autoComplete="off"
            className="w-full p-4 pr-14 rounded-full bg-white border border-blue-300 text-black shadow-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-lg"
          />
          <button 
            type="submit"
            disabled={isSubmitting}
            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-blue-200 disabled:text-gray-500 transition-all cursor-pointer"
          >
            <ArrowRight size={24} />
          </button>
      </Form>
    </div>
    );
}
