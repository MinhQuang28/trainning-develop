import { SendHorizontalIcon } from "lucide-react";
import ollama from "ollama";
import { Form, useActionData } from "react-router";
import ChatBubble from "~/components/ChatBubble";
import { HEADER_HEIGHT } from "~/config/constant";

const handleChat = (prompt: string) => {
    return ollama.chat({
        model: "gpt-oss:120b-cloud",
        messages: [{ role: "user", content: prompt }]
    });
};

export async function action({ request }: any) {
    if (request.method === "POST") {
        const payload = await request.formData();
        const response = await handleChat(payload.prompt);
        return { status: 200, result: response };
    }
    return { status: 405, error: "Method not allowed" };
}

export default function Home() {
    const data = useActionData();

    return (
        <div className="w-full max-h-screen h-screen flex flex-col">
            {/* Header */}  
            <div className="w-full flex bg-gray-50 h-20 items-center px-6 border-b border-border">
                <h2 className="font-bold text-2xl">New Chat</h2>
            </div>
            {/* Content */}
            <div className="flex flex-col flex-1 ">
                <div
                    className="flex flex-col-reverse overflow-y-auto w-full flex-1 gap-3 pl-12 pr-12 py-3"
                    style={{ maxHeight: `calc(100vh - ${HEADER_HEIGHT} - 64px - 12px)` }}
                >
                    {data?.messagesMapping?.map((message: any) => (
                        <ChatBubble key={message.id} message={message} />
                    ))}
                </div>
                <div className="px-12">
                    <div className="self-end rounded-xl border border-border h-16 w-full relative">
                        <Form method="POST" className="h-full">
                            <input
                                type="text"
                                name="prompt"
                                className="h-full text-lg focus-visible:outline-0 border-0! focus-visible:border-0! focus:border-0 w-full p-3 pl-6 rounded-xl"
                            />
                            <button
                                type="submit"
                                className="group hover:bg-hover absolute right-3 top-2.5 cursor-pointer p-3 rounded-md"
                            >
                                <SendHorizontalIcon className="h-5 w-5 group-hover:-rotate-45 transition-all ease-linear duration-200" />
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
