import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "~/utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

function parseCookie(cookieStr: string) {
  const obj: Record<string, string> = {};
  cookieStr.split(";").forEach(pair => {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const key = pair.substring(0, idx).trim();
      const value = pair.substring(idx + 1).trim();
      obj[key] = value;
    }
  });
  return obj;
}
export function getAuthToken(request: Request) {
  const cookie = request.headers.get("Cookie") || "";
  const cookies = parseCookie(cookie);

  if (cookies.token) {
    try {
      const user = jwt.verify(
        cookies.token,
        JWT_SECRET
      ) as JwtPayload & { id: string };

      return { userId: user.id, isGuest: false };
    } catch (e) {
      console.error("JWT verify failed", e);
    }
  }
  let sessionId = cookies.session_token;

  if (!sessionId) {
    sessionId = "";
  }

  return { sessionId, isGuest: true };
}

export async function login(email: string, password: string) {
  const auth = await prisma.auth.findUnique({ where: { email }, include: { user: true } });
  if (!auth) throw new Error("Email không tồn tại");

  const valid = await bcrypt.compare(password, auth.password);
  if (!valid) throw new Error("Sai mật khẩu");

  const token = jwt.sign({ id: auth.user.id }, JWT_SECRET, { expiresIn: "1d" });
  return token;
}

type RegisterParams = {
  name: string;
  email: string;
  password: string;
};

export async function register(params: RegisterParams) {
  const { name, email, password } = params;
  const existing = await prisma.auth.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email đã tồn tại");
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      auth: {
        create: {
          email,
          password: hashed,
        },
      },
    },
  });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
  return token;
}