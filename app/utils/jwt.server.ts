import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export type UserPayload = {
  id: string;
  email: string;
};

export function createToken(payload: UserPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", 
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null; 
  }
}