import React from "react";
import { Outlet, useFetcher, useParams } from "react-router";
import prisma from "~/config/db";
import type { Route } from "./+types/layout";
import { StatusCodes } from "http-status-codes";
import { requiresUserAuthentication } from "~/utils/auth.service";
import ApiResponse from "~/types/response";
import useInfinityScroll from "~/hooks/useInfinityScroll";
import SideBar from "./SideBar";
import { SIDEBAR_CONVERSATIONS_LIMIT } from "~/config/constant";
import MobileSideBar from "./MobileSideBar";
import { ChevronsRightIcon } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requiresUserAuthentication(request);
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");

    const conversations = await prisma.conversation.findMany({
        where: {
            userId: user.id
        },
        omit: {
            userId: true,
            updatedAt: true,
            createdAt: true,
            context: true
        },
        orderBy: {
            updatedAt: "desc"
        },
        take: SIDEBAR_CONVERSATIONS_LIMIT + 1,
        ...(cursor && {
            cursor: {
                id: cursor
            },
            skip: 1
        })
    });

    const hasMore = conversations.length > SIDEBAR_CONVERSATIONS_LIMIT;
    const items = hasMore ? conversations.slice(0, SIDEBAR_CONVERSATIONS_LIMIT) : conversations;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return ApiResponse.ok("success", true, StatusCodes.OK, {
        user: { ...user },
        conversations: [...items],
        nextCursor,
        hasMore
    });
}

const MainLayout = ({ loaderData }: Route.ComponentProps) => {
    const [isSideBarOpen, setIsSideBarOpen] = React.useState<boolean>(true);
    const { conversations, user, nextCursor, hasMore: initialHasMore } = loaderData.data;
    const param = useParams();
    const conversationDetails = conversations.find((conversation) => conversation.id === param.id) || null;

    const { scrollRef, observerRef, isLoading, hasMore, data, reset } = useInfinityScroll({
        initialData: conversations,
        initialCursor: nextCursor,
        initialHasMore,
        dataKey: "conversations",
        endpoint: "/api/v1/conversations"
    });

    React.useEffect(() => {
        reset();
    }, [param.id]);

    return (
        <div className="flex overflow-hidden h-screen w-screen">
            <SideBar
                observerRef={observerRef}
                scrollRef={scrollRef}
                open={isSideBarOpen}
                onToggle={setIsSideBarOpen}
                conversations={data}
                userDetails={user}
                activeConversationId={param?.id}
                hasMoreConversations={hasMore}
                isLoading={isLoading}
                className="sm:flex hidden"
            />
            <MobileSideBar
                observerRef={observerRef}
                scrollRef={scrollRef}
                open={isSideBarOpen}
                onToggle={setIsSideBarOpen}
                conversations={data}
                userDetails={user}
                activeConversationId={param?.id}
                hasMoreConversations={hasMore}
                isLoading={isLoading}
                className="sm:hidden flex"
            />
            <div className="flex-col h-screen max-h-screen overflow-hidden bg-base w-full">
                <div className="w-full flex bg-surface h-20 items-center px-6 border-b border-border">
                    <h2 className="font-bold sm:text-2xl text-lg text-text-primary max-sm:flex max-sm:items-center max-sm:justify-center max-sm:gap-3">
                        <button disabled={isSideBarOpen} onClick={() => setIsSideBarOpen(true)} className="max-sm:block hidden">
                            <ChevronsRightIcon />
                        </button>
                        {conversationDetails?.title || "New Chat"}
                    </h2>
                </div>

                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
