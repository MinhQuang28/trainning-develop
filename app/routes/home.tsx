import { Sparkles, ArrowRight } from "lucide-react"; 
import { Form, redirect, useNavigation } from "react-router"; 
import type { ActionFunctionArgs } from "react-router";
import { createChatSession } from "~/services/chat.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;

  if (!prompt || !prompt.trim()) return null;

  const chatId = await createChatSession(prompt);

  return redirect(`/c/${chatId}`);
}

export default function Home() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in relative bg-slate-900">
      
      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 shadow-lg shadow-blue-500/20 mb-4">
            <Sparkles className="text-white w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 pb-1">
          Xin chào, User
        </h1>
        <p className="text-xl text-slate-400">Tôi có thể giúp gì cho bạn hôm nay?</p>
      </div>
      
      <Form method="post" className="w-full max-w-2xl relative group">
          <input
            type="text"
            name="prompt"
            placeholder="Nhập câu hỏi của bạn..."
            autoComplete="off"
            className="w-full p-4 pr-14 rounded-full bg-slate-800 border border-slate-700 text-slate-100 shadow-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 text-lg"
          />
          <button 
            type="submit"
            disabled={isSubmitting}
            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all cursor-pointer"
          >
             <ArrowRight size={24} />
          </button>
      </Form>
    </div>
  );
}