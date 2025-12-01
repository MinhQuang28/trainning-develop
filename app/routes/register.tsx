import { Form, Link, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { register } from "~/services/auth.server";
import { createUserSession } from "~/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Vui lòng nhập đầy đủ thông tin" };
  }

  try {
    const user = await register({ email, password, name });
    return createUserSession(user.id, email, "/");
    
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function Register() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-400">Đăng ký tài khoản</h1>
        
        {actionData?.error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/20">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
           <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-400">Tên hiển thị</label>
            <input 
              name="name" 
              type="text" 
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-purple-500 outline-none transition-colors text-slate-100"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-400">Email</label>
            <input 
              name="email" 
              type="email" 
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-purple-500 outline-none transition-colors text-slate-100"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-400">Mật khẩu</label>
            <input 
              name="password" 
              type="password" 
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-purple-500 outline-none transition-colors text-slate-100"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white p-3.5 rounded-lg font-medium transition-colors disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </Form>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          Đã có tài khoản? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}