import { requiresUserAuthentication } from "~/utils/auth.service";
import prisma from "~/config/db";
import { StatusCodes } from "http-status-codes";
import { MESSAGE_LIMIT } from "~/config/constant";
import type { Route } from "./+types/messages";

export async function loader({ request, params }: Route.LoaderArgs) {
    await requiresUserAuthentication(request);

    const { id } = params;

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");

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
            messages: items,
            nextCursor: nextCursor,
            hasMore: hasMore
        }
    };
}
