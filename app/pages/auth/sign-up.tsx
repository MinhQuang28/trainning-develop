import { BotIcon } from "lucide-react";
import { Form, Link, redirect } from "react-router";
import FormField from "~/components/ui/FormField";
import Separator from "~/components/ui/Separator";
import GoogleIcon from "~/assets/icons/google.svg?react";
import type { Route } from "./+types/sign-in";
import prisma from "~/config/db";
import { createTokens } from "~/utils/jwt.service";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const payload = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string
    };

    const user = await prisma.users.create({
        data: {
            ...payload
        },
        omit: {
            password: true
        }
    });

    const { accessToken, refreshToken, refreshExp, accessExp } = createTokens(user.id);

    return redirect("/", {
        headers: [
            [
                "Set-Cookie",
                `refresh_token=${refreshToken}; HttpOnly; Path=/; Expires=${new Date(refreshExp * 1000).toUTCString()}; Secure; SameSite=Strict`
            ],
            [
                "Set-Cookie",
                `access_token=${accessToken}; HttpOnly; Path=/; Expires=${new Date(accessExp * 1000).toUTCString()}; Secure; SameSite=Strict`
            ]
        ]
    });
}

const SignUp = () => {
    return (
        <Form className="flex flex-col lg:basis-1/2 lg:px-28 md:px-14 px-7 w-full justify-center md:gap-8 gap-5">
            <div className="flex-col flex gap-4">
                <span className="flex items-center gap-2 text-lg text-text-primary font-semibold">
                    <BotIcon className="w-8 h-8" />
                    Script
                </span>
                <h1 className="text-xl font-medium">Welcome</h1>
                <div className="flex justify-between text-[13px] items-center">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
            <button
                className="py-3 h-fit font-medium cursor-pointer bg-transparent hover:bg-hover border border-border rounded-lg flex items-center justify-center gap-2 text-text-primary w-full"
                type="button"
                onClick={() => {}}
            >
                <GoogleIcon className="h-5 w-5" />
                Continue With Google
            </button>
            <div className="flex items-center overflow-hidden gap-[4%]">
                <Separator className="data-[orientation=horizontal]:w-[45%]" />
                <p className="opacity-40 text-sm">or</p>
                <Separator className="data-[orientation=horizontal]:w-[45%]" />
            </div>
            <div className="flex w-full gap-5">
                <FormField name="firstName" label="First name" />
                <FormField name="lastName" label="Last name" />
            </div>
            <FormField name="email" label="Email" />
            <FormField name="password" label="Password" type="password" />

            <button type="submit" className="py-3 h-fit cursor-pointer bg-black rounded-lg text-white">
                Register
            </button>
        </Form>
    );
};

export default SignUp;
