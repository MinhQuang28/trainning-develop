import { redirect } from "react-router";
import prisma from "../lib/db";
import type { Route } from "./+types/chat.new";

const TEMP_USER_ID = 1;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const newConversation = await prisma.conversation.create({
    data: {
      title: "Cuộc trò chuyện mới",
      userId: TEMP_USER_ID,
    },
  });

  return redirect(`/chat/${newConversation.id}`);
};

export default function () {
  return null;
}