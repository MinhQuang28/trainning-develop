import React from "react";
import { LoaderCircleIcon, SendHorizontalIcon } from "lucide-react";
import { Form, useActionData, useFetcher, useNavigate, useParams, useRevalidator } from "react-router";
import ChatBubble from "~/components/ChatBubble";
import { HEADER_HEIGHT, MESSAGE_LIMIT } from "~/config/constant";
import prisma from "~/config/db";
import { StatusCodes } from "http-status-codes";
import { generateAnswer, generateTitle } from "~/utils/chat.service";
import clsx from "clsx";
import { requiresUserAuthentication } from "~/utils/auth.service";
import type { Route } from "./+types/chat";
import useInfinityScroll from "~/hooks/useInfinityScroll";
import LoadingIndicator from "./components/LoadingIndicator";

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requiresUserAuthentication(request);

    const { id } = params;

    if (!id) {
        return {
            status: StatusCodes.OK,
            message: "success",
            data: {
                user: { ...user },
                conversation: { messages: [], nextCursor: null, hasMore: false }
            }
        };
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");

    const conversation = await prisma.conversation.findUnique({
        where: {
            id: id,
            userId: user.id
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
        take: MESSAGE_LIMIT + 1,
        ...(cursor && {
            cursor: {
                id: cursor
            },
            skip: 1
        })
    });

    const hasMore = messages.length > MESSAGE_LIMIT;
    const items = hasMore ? messages.slice(0, MESSAGE_LIMIT) : messages;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
        status: StatusCodes.OK,
        message: "success",
        data: {
            user: { ...user },
            conversation: { ...conversation, messages: items, nextCursor: nextCursor, hasMore: hasMore }
        }
    };
}

export async function action({ request, params }: Route.ActionArgs) {
    if (request.method === "POST") {
        const user = await requiresUserAuthentication(request);
        const userId = user.id;
        const payload = await request.formData();
        const prompt = payload.get("prompt") as string;
        let conversationId;
        let newConversation;

        if (!params.id) {
            newConversation = await prisma.conversation.create({
                data: {
                    userId,
                    title: await generateTitle(prompt)
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
            }
        });

        const answers = await generateAnswer(prompt, history);

        await prisma.message.create({
            data: {
                role: "user",
                conversationId,
                text: prompt
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
    const loaderResponse = loaderData;
    const conversationDetails = loaderResponse.data?.conversation;
    const user = loaderResponse.data?.user;
    const { messages, hasMore: initialHasMore, nextCursor } = conversationDetails;
    const navigate = useNavigate();
    const param = useParams();
    const fetcher = useFetcher();
    const revalidator = useRevalidator();

    const {
        data: loadedMessages,
        isLoading,
        hasMore,
        scrollRef,
        observerRef,
        reset
    } = useInfinityScroll({
        initialHasMore,
        initialCursor: nextCursor,
        initialData: messages,
        dataKey: "messages",
        endpoint: `/api/messages/${param.id}`
    });

    const [prompt, setPrompt] = React.useState<string>("");

    const optimisticMessages = React.useMemo(() => {
        if (!param?.id) return [];
        if (!fetcher.formData) return loadedMessages;

        const newMessage = [
            {
                id: `temp-${Date.now() + 1000}`,
                role: "assistant",
                text: fetcher.formData.get("prompt") as string,
                isPending: true
            },
            {
                id: `temp-${Date.now()}`,
                role: "user",
                text: fetcher.formData.get("prompt") as string
            }
        ];

        return [...newMessage, ...loadedMessages];
    }, [fetcher.data, loadedMessages, fetcher.formData, param.id]);

    React.useEffect(() => {
        if (fetcher.data?.data && fetcher.state === "idle") {
            navigate(`/${fetcher.data.data.id}`, { replace: true });
        }
    }, [fetcher.data, fetcher.state, navigate]);

    React.useEffect(() => {
        reset();
    }, [param.id]);

    React.useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            reset();
            revalidator.revalidate();
        }
    }, [fetcher.state]);

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
                    ref={scrollRef}
                    className={clsx(
                        "flex overflow-y-auto w-full flex-1 gap-8 pl-12 pr-12 pt-6 pb-12",
                        param?.id ? "flex-col-reverse" : "flex-col items-center justify-center"
                    )}
                    style={{ maxHeight: `calc(100vh - ${HEADER_HEIGHT} - 64px - 12px)` }}
                >
                    {param?.id ? (
                        <React.Fragment>
                            {optimisticMessages.map((message) => (
                                <ChatBubble
                                    key={message.id}
                                    message={message}
                                    userDetails={user}
                                    className="w-[70%] h-fit"
                                />
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

                    {hasMore && <div ref={observerRef}></div>}

                    {isLoading && <LoadingIndicator className="mb-3" />}
                </div>
                <div className="px-12">
                    <div className="self-end rounded-xl border border-border h-16 w-full text-text-primary relative">
                        <fetcher.Form
                            method="POST"
                            action={`/${param?.id || ""}`}
                            onSubmit={() => {
                                setPrompt("");
                            }}
                            className="h-full"
                        >
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
                                disabled={fetcher.state !== "idle"}
                                className="group hover:bg-hover  absolute right-3 top-2.5 cursor-pointer p-3 rounded-md"
                            >
                                {fetcher.state === "idle" ? (
                                    <SendHorizontalIcon className="h-5 w-5 group-hover:-rotate-45 transition-all ease-linear duration-200 text-text-primary" />
                                ) : (
                                    <LoaderCircleIcon className="h-5 w-5 animate-spin text-text-primary" />
                                )}
                            </button>
                        </fetcher.Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
