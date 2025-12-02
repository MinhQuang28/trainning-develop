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

export async function action({ request }: Route.LoaderArgs) {}

const MainLayout = ({ loaderData }: Route.ComponentProps) => {
    const [isSideBarOpen, setIsSideBarOpen] = React.useState<boolean>(true);
    const fetcher = useFetcher();
    const { conversations, user, nextCursor, hasMore: initialHasMore } = loaderData.data;
    const param = useParams();

    const { scrollRef, observerRef, isLoading, hasMore, data, reset } = useInfinityScroll({
        initialData: conversations,
        initialCursor: nextCursor,
        initialHasMore,
        dataKey: "conversations",
        endpoint: "/api/conversations"
    });

    const handleLogout = () => {
        fetcher.load("/api/logout");
    };

    React.useEffect(() => {
        reset();
    }, [param.id]);

    return (
        <div className="flex">
            <SideBar
                observerRef={observerRef}
                scrollRef={scrollRef}
                open={isSideBarOpen}
                onToggle={setIsSideBarOpen}
                conversations={data}
                userDetails={user}
                activeConversationId={param?.id}
                onLogout={handleLogout}
                hasMoreConversations={hasMore}
                isLoading={isLoading}
            />
            <Outlet />
        </div>
    );
};

export default MainLayout;
