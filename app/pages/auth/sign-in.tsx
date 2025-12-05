import { BotIcon } from "lucide-react";
import { Form, Link, redirect, useActionData } from "react-router";
import FormField from "~/components/ui/FormField";
import Separator from "~/components/ui/Separator";
import GoogleIcon from "~/assets/icons/google.svg?react";
import type { Route } from "./+types/sign-in";
import prisma from "~/config/db";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { commitSession, getSession } from "~/sessions.server";
import { useAuth0 } from "@auth0/auth0-react";

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    if (session.has("userId")) {
        return redirect("/");
    }
}

export async function action({ request }: Route.ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    const formData = await request.formData();
    const payload = {
        email: formData.get("email") as string,
        password: formData.get("password") as string
    };

    if (!payload.email && !payload.password) {
        return {
            status: StatusCodes.BAD_REQUEST,
            success: false,
            errors: { email: "Email is require", password: "Password is require" }
        };
    }

    if (!payload.email) {
        return {
            status: StatusCodes.BAD_REQUEST,
            success: false,
            errors: { email: "Email is require" }
        };
    } else if (!payload.password) {
        return {
            status: StatusCodes.BAD_REQUEST,
            success: false,
            errors: { password: "Password is require" }
        };
    }

    const user = await prisma.users.findUnique({
        where: {
            email: payload.email
        }
    });

    if (!user) {
        return {
            status: StatusCodes.NOT_FOUND,
            success: false,
            errors: { email: "Email is not registered" }
        };
    }

    if (!bcrypt.compareSync(payload.password, user.password)) {
        return {
            status: StatusCodes.BAD_REQUEST,
            success: false,
            errors: {
                password: "Incorrect password"
            }
        };
    }

    session.set("userId", user.id);

    return redirect("/", {
        headers: {
            "Set-Cookie": await commitSession(session)
        }
    });
}

const SignIn = () => {
    const response = useActionData();
    const { loginWithRedirect } = useAuth0();

    return (
        <Form
            method="POST"
            className="flex flex-col lg:basis-1/2 lg:px-28 md:px-14 px-7 w-full justify-center md:gap-8 gap-5"
        >
            <div className="flex-col flex gap-4">
                <span className="flex items-center gap-2 text-lg text-black font-semibold">
                    <BotIcon className="w-8 h-8" />
                    Script
                </span>
                <h1 className="text-xl font-medium">Welcome</h1>
                <div className="flex justify-between text-[13px] items-center">
                    <p>
                        Already have an account?{" "}
                        <Link to="/register" className="text-primary">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
            <button
                className="py-3 h-fit font-medium cursor-pointer bg-transparent hover:bg-[#e5e7eb] border border-[#d1d5db] rounded-lg flex items-center justify-center gap-2 text-black w-full"
                type="button"
                onClick={() =>
                    loginWithRedirect({
                        authorizationParams: {
                            connection: "google-oauth2"
                        }
                    })
                }
            >
                <GoogleIcon className="h-5 w-5" />
                Continue With Google
            </button>
            <div className="flex items-center overflow-hidden gap-[4%]">
                <Separator className="data-[orientation=horizontal]:w-[45%]" />
                <p className="opacity-40 text-sm">or</p>
                <Separator className="data-[orientation=horizontal]:w-[45%]" />
            </div>
            <FormField name="email" label="Email" error={response?.errors?.email} />
            <FormField name="password" label="Password" type="password" error={response?.errors?.password} />

            <button type="submit" className="py-3 h-fit cursor-pointer bg-black rounded-lg text-white">
                Login
            </button>
        </Form>
    );
};

export default SignIn;
