import { redirect } from "react-router";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
    return redirect("/login", {
        headers: [
            ["Set-Cookie", "access_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"],
            ["Set-Cookie", "refresh_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"]
        ]
    });
}
