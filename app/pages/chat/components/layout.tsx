import React from "react";
import { Outlet, useParams } from "react-router";
import prisma from "~/config/db";
import SideBar from "~/layout/SideBar";
import type { Route } from "./+types/layout";
import { StatusCodes } from "http-status-codes";

export async function loader() {
    const conversations = await prisma.conversation.findMany({
        where: {
            userId: "8b6063dd-fcca-477b-aa5f-a0014aabd188"
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
        take: 30
    });

    return {
        status: StatusCodes.OK,
        message: "success",
        data: conversations
    };
}

const MainLayout = ({ loaderData }: Route.ComponentProps) => {
    const [isSideBarOpen, setIsSideBarOpen] = React.useState<boolean>(true);
    const { data: conversations } = loaderData;
    const param = useParams();

    return (
        <div className="flex">
            <SideBar
                open={isSideBarOpen}
                onToggle={setIsSideBarOpen}
                conversations={conversations}
                activeConversationId={param?.id}
            />
            <Outlet />
        </div>
    );
};

export default MainLayout;
