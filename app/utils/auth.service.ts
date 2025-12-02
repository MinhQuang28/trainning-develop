import { redirect } from "react-router";
import { getUserIdFromCookies } from "./jwt.service";
import prisma from "~/config/db";

export async function requiresUserAuthentication(request: Request) {
    const cookies = request.headers.get("Cookie");

    if (!cookies) {
        throw redirect("/login");
    }

    const [refresh_token, access_token] = cookies.split("; ");

    if (!access_token) {
        throw redirect("/login");
    }

    const userId = getUserIdFromCookies(access_token);

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        },
        omit: {
            password: true
        }
    });

    if (!user) {
        throw redirect("/login");
    }

    return user;
}
