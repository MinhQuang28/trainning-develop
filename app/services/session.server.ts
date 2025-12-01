import { createCookieSessionStorage, redirect } from "react-router";
import { createToken, verifyToken } from "~/utils/jwt.server"; 

const storage = createCookieSessionStorage({
  cookie: {
    name: "AI_CHAT_TOKEN", 
    secrets: [process.env.SESSION_SECRET as string],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
  },
});

export async function getUserId(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const token = session.get("accessToken");

  if (!token) return null;

  const payload = verifyToken(token); 
  if (!payload) return null;

  return payload.id;
}

export async function createUserSession(userId: string, email: string, redirectTo: string) {
  const session = await storage.getSession();
  
  const token = createToken({ id: userId, email });
  
  session.set("accessToken", token);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}