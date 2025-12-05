import React, { useState } from "react";
import {
  Form,
  useActionData,
  redirect,
  type ActionFunctionArgs,
} from "react-router";
import { prisma } from "lib/prisma";
import bcrypt from "bcryptjs";
import { useEffect } from "react";
import { createUserSession } from "lib/auth";

type ActionResponse = {
  error?: string;
  success?: boolean;
  user?: { id: string; name: string | null; email: string };
} | null;

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const actionType = form.get("_action");

  const email = form.get("email") as string;
  const password = form.get("password") as string;
  const name = form.get("name") as string;

  // LOGIN
  if (actionType === "login") {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return { error: "Email hoặc mật khẩu không chính xác!" };
      }
      return createUserSession(user.id, "/");
    } catch (error) {
      console.log(error);
      return { error: "Lỗi kết nối PostgreSQL!" };
    }
  }

  // REGISTER
  if (actionType === "register") {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return { error: "Email đã tồn tại!" };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });
      return createUserSession(newUser.id, "/");
    } catch (error) {
      console.error(error);
      return { error: "Lỗi kết nối PostgreSQL!" };
    }
  }

  return null;
}

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [feedback, setFeedback] = useState<ActionResponse>(null);

  const actionData = useActionData() as ActionResponse;

  useEffect(() => {
    if (actionData) {
      setFeedback(actionData);
    }
  }, [actionData]);

  const handleSwitchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setFeedback(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full relative max-w-md bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm border border-gray-100 min-h-[390px]">
        {/* Switch Buttons */}
        <div className="bg-gray-100 p-1 rounded-full flex mb-6">
          <button
            onClick={() => handleSwitchMode("login")}
            className={`flex-1 py-2 rounded-full transition-all ${
              mode === "login"
                ? "bg-white shadow text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => handleSwitchMode("register")}
            className={`flex-1 py-2 rounded-full transition-all ${
              mode === "register"
                ? "bg-white shadow text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        <div className="absolute -top-15 left-0 w-full px-8 z-50 pointer-events-none flex justify-center">
          {(feedback?.error || feedback?.success) && (
            <div
              className={`
                shadow-lg rounded-xl px-4 py-2 text-sm font-medium animate-fadeIn
                pointer-events-auto transform transition-all duration-300
                ${feedback?.error ? "bg-red-500 text-white" : "bg-green-500 text-white"}
              `}
            >
              {feedback?.error}
              {feedback?.success &&
                (mode === "register"
                  ? "Đăng ký thành công!"
                  : "Đăng nhập thành công!")}
            </div>
          )}
        </div>

        {/* FORM LOGIN */}
        {mode === "login" && (
          <Form method="post" className="space-y-4 animate-fadeIn pt-7">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="border border-gray-200 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="border border-gray-200 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />
            <button
              type="submit"
              name="_action"
              value="login"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform active:scale-95"
            >
              Login
            </button>
          </Form>
        )}

        {/* FORM REGISTER */}
        {mode === "register" && (
          <Form method="post" className="space-y-4 animate-fadeIn">
            <input
              type="text"
              name="name"
              placeholder="Full name"
              required
              className="border border-gray-200 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="border border-gray-200 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="border border-gray-200 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />
            <button
              type="submit"
              name="_action"
              value="register"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform active:scale-95"
            >
              Register
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
