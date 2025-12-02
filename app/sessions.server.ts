import { createCookieSessionStorage } from "react-router";

type SessionData = {
    userId: string;
};

type SessionFlashData = {
    error: string;
};

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
    SessionData,
    SessionFlashData
>({
    cookie: {
        name: "__session",
        httpOnly: true,
        maxAge: 6000,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.JWT_SECRET_KEY as string],
        secure: true
    }
});

export { getSession, commitSession, destroySession };
