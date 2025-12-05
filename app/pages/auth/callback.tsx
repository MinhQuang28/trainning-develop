import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoadingIndicator from "../chat/components/LoadingIndicator";
import type { Route } from "./+types/callback";
import prisma from "~/config/db";
import { commitSession, getSession } from "~/sessions.server";
import { redirect, useFetcher } from "react-router";
import { randomBytes } from "crypto";

export async function action({ request }: Route.ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    const formData = await request.formData();
    const payload = {
        email: formData.get("email") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        avatar: formData.get("avatar") as string
    };

    let user = await prisma.users.findFirst({ where: { email: payload.email } });

    if (!user) {
        user = await prisma.users.create({
            data: {
                ...payload,

                password: randomBytes(32).toString("hex")
            }
        });
    }

    session.set("userId", user.id);

    return redirect("/", {
        headers: {
            "Set-Cookie": await commitSession(session)
        }
    });
}

const CallbackPage = () => {
    const { user } = useAuth0();
    const fetcher = useFetcher();

    React.useEffect(() => {
        if (user) {
            fetcher.submit(
                {
                    email: user.email ?? "",
                    firstName: user.given_name ?? "",
                    lastName: user.family_name ?? "",
                    avatar: user.picture ?? ""
                },
                {
                    method: "POST",
                    encType: "application/x-www-form-urlencoded"
                }
            );
        }
    }, [user]);

    return (
        <div className="flex flex-col gap-2 h-screen w-full justify-center items-center bg-base">
            <LoadingIndicator size={50} className="text-black" />
            <p className="text-lg font-semibold text-text-secondary">Waiting...</p>
        </div>
    );
};

export default CallbackPage;
