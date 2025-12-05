import { createCookie, redirect } from "react-router";
import jwt from "jsonwebtoken";

const JWT_SECRET = String(process.env.JWT_SECRET);

export const authCookie = createCookie("auth_token", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 3,
});

export async function createUserSession(userId: string, redirectTo: string) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "3d" });
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authCookie.serialize(token),
    },
  });
}

export async function getUserId(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await authCookie.parse(cookieHeader);

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch (error) {
    return null;
  }
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/auth");
  }
  return userId;
}
export async function logout(redirectTo: string = "/auth") {
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authCookie.serialize("", {
        maxAge: 0,
      }),
    },
  });
}
