import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export function signToken(payloay: object){
    return jwt.sign(payloay, SECRET, {expiresIn: "2h"});
}

export function verifyToken(token: string){
    return jwt.verify(token, SECRET);
}
