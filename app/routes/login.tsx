import { Form, Link, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { login } from "~/services/auth.server";
import { createUserSession } from "~/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ thông tin" };
  }

  const user = await login({ email, password });
  
  if (!user) {
    return { error: "Email hoặc mật khẩu không chính xác" };
  }

  return createUserSession(user.id, user.email, "/");
}

export default function Login() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Đăng nhập</h1>
        
        {actionData?.error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/20">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-400">Email</label>
            <input 
              name="email" 
              type="email" 
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none transition-colors text-slate-100"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-400">Mật khẩu</label>
            <input 
              name="password" 
              type="password" 
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none transition-colors text-slate-100"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-lg font-medium transition-colors disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </Form>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          Chưa có tài khoản? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}