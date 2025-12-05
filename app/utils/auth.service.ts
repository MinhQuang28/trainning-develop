import { redirect } from "react-router";
import prisma from "~/config/db";
import { getSession } from "~/sessions.server";

export async function requiresUserAuthentication(request: Request) {
    const session = await getSession(request.headers.get("Cookie"));

    if (!session.has("userId")) {
        throw redirect("/login");
    }

    const userId = session.get("userId");

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        },
        omit: {
            password: true
        }
    });

    if (!user) {
        throw redirect("/login", {
            status: 403
        });
    }

    return user;
}
