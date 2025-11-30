import { Link } from "react-router";
import { Bot, Send, Sparkles } from "lucide-react";

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col h-full bg-gray-950">

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto py-8 px-4">
        <div className="max-w-3xl w-full space-y-12">

          {/* Greeting */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-2xl">
              <Bot size={36} className="text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Xin chào! Tôi là ChanDy-AI
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Bạn muốn hỏi gì hôm nay? Tôi có thể giúp bạn giải đáp thắc mắc,
              viết văn, lập trình, học tập hay đơn giản là trò chuyện.
            </p>
          </div>

          {/* Example Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Giải thích về thuyết tương đối hẹp bằng tiếng Việt đơn giản",
              "Viết một bài thơ tình 8 câu theo phong cách Xuân Diệu",
              "Giúp mình debug đoạn code React này bị lỗi useEffect",
              "Lập kế hoạch du lịch Đà Lạt 3 ngày 2 đêm dưới 5 triệu",
            ].map((prompt, i) => (
              <div
                key={i}
                className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all cursor-pointer group"
              >
                <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                  {prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Bar – Chỉ để trang trí, không hoạt động */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 px-5 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus-within:ring-2 focus-within:ring-purple-500 resize-none overflow-hidden flex items-center">
              <span className="text-gray-500">Nhập tin nhắn để bắt đầu...</span>
            </div>

            <Link
              to="/chat/new"
              className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-medium"
            >
              <Send size={18} />
              Bắt đầu
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            ChatAI có thể tạo ra thông tin không chính xác • Hãy kiểm chứng lại những nội dung quan trọng
          </p>
        </div>
      </div>
    </div>
  );
}