import React from "react";
import { SendHorizontalIcon } from "lucide-react";
import { Form, useActionData, useNavigate, useParams } from "react-router";
import ChatBubble from "~/components/ChatBubble";
import { HEADER_HEIGHT } from "~/config/constant";
import type { Route } from "./+types/chat";
import prisma from "~/config/db";
import { StatusCodes } from "http-status-codes";
import { generateAnswer } from "~/utils/chat.service";
import clsx from "clsx";

export async function loader({ params }: Route.LoaderArgs) {
    const { id } = params;

    if (!id) {
        return {
            status: StatusCodes.OK,
            message: "success",
            data: null
        };
    }

    const conversation = await prisma.conversation.findUnique({
        where: {
            id: id
        },
        omit: {
            userId: true
        }
    });

    const messages = await prisma.message.findMany({
        where: {
            conversationId: id
        },
        omit: {
            conversationId: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 10
    });

    return {
        status: StatusCodes.OK,
        message: "success",
        data: { ...conversation, messages }
    };
}

export async function action({ request, params }: Route.ActionArgs) {
    if (request.method === "POST") {
        const userId = "8b6063dd-fcca-477b-aa5f-a0014aabd188";
        const payload = Object.fromEntries((await request.formData()).entries()) as { prompt: string };
        let conversationId;
        let newConversation;

        if (!params.id) {
            newConversation = await prisma.conversation.create({
                data: {
                    userId,
                    title: "New Chat"
                }
            });

            conversationId = newConversation.id;
        } else {
            conversationId = params.id;
        }

        const history = await prisma.message.findMany({
            where: {
                conversationId
            },
            omit: {
                conversationId: true
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 10
        });

        const answers = await generateAnswer(payload.prompt, history);

        await prisma.message.create({
            data: {
                role: "user",
                conversationId,
                text: payload.prompt
            }
        });

        if (answers.done === true) {
            await prisma.message.create({
                data: {
                    role: "assistant",
                    conversationId,
                    text: answers.message.content
                }
            });
        }

        return { status: StatusCodes.OK, message: "success", data: newConversation || null };
    }

    return { status: StatusCodes.METHOD_NOT_ALLOWED, error: "Method not allowed" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const { data: conversationDetails } = loaderData;
    const data = useActionData();
    const navigate = useNavigate();
    const param = useParams();

    const [prompt, setPrompt] = React.useState<string>("");

    React.useEffect(() => {
        if (data?.data) {
            navigate(`/${data.data.id}`, { replace: true });
        }
    }, [data]);

    return (
        <div className="w-full max-h-screen h-screen flex flex-col">
            {/* Header */}
            <div className="w-full flex bg-surface h-20 items-center px-6 border-b border-border">
                <h2 className="font-bold text-2xl text-text-primary">
                    {conversationDetails?.title || "New Chat"}
                </h2>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 bg-base">
                <div
                    className={clsx(
                        "flex overflow-y-auto w-full flex-1 gap-3 pl-12 pr-12 pt-6 pb-12",
                        param?.id ? "flex-col-reverse" : "flex-col items-center justify-center"
                    )}
                    style={{ maxHeight: `calc(100vh - ${HEADER_HEIGHT} - 64px - 12px)` }}
                >
                    {param?.id ? (
                        <React.Fragment>
                            {conversationDetails?.messages.map((message) => (
                                <ChatBubble key={message.id} message={message} className="w-[70%] h-fit" />
                            ))}
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <h2 className="font-bold text-7xl text-text-primary">Welcome to Script</h2>
                            <p className="text-lg text-text-secondary">
                                Start by Script, a smart chat assistant designed to answer questions and make
                                conversations seamless and engaging.
                            </p>
                        </React.Fragment>
                    )}
                </div>
                <div className="px-12">
                    <div className="self-end rounded-xl border border-border h-16 w-full text-text-primary relative">
                        <Form method="POST" className="h-full">
                            <input
                                type="text"
                                name="prompt"
                                autoComplete="off"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="h-full text-lg focus-visible:outline-0 border-0! focus-visible:border-0! focus:border-0 w-full p-3 pl-6 rounded-xl"
                            />
                            <button
                                type="submit"
                                className="group hover:bg-hover  absolute right-3 top-2.5 cursor-pointer p-3 rounded-md"
                            >
                                <SendHorizontalIcon className="h-5 w-5 group-hover:-rotate-45 transition-all ease-linear duration-200 text-text-primary" />
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
