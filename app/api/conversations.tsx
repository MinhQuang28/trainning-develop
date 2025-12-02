import type { Route } from "./+types/conversations";
import { requiresUserAuthentication } from "~/utils/auth.service";
import prisma from "~/config/db";
import ApiResponse from "~/types/response";
import { StatusCodes } from "http-status-codes";
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
        conversations: items,
        nextCursor,
        hasMore
    });
}
