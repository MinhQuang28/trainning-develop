import prisma from "../lib/db";
import bcrypt from "bcryptjs";
import {verifyToken} from "../utils/jwt.server";
import type { JwtPayload } from "jsonwebtoken";


//REGISTER
export async function registerUser(
    email: string,
    password: string, 
    name?: string
) {
    const existing = await prisma.user.findUnique({where: {email} });
    if(existing) throw new Error("email ton tai");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name,
        },
    });
    return user;  
}

//LOGIN

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({where: {email}});
    if(!user) throw new Error("Email hoac mat khau sai");

    const ok = await bcrypt.compare(password, user.password);
    if(!ok) throw new Error("Email hoac mat khau sai");

    return user;
}

export function requireAuth(request: Request){
    const authHeader = request.headers.get("Authorization");
    if(!authHeader) throw new Error("Loi uy xac thuc");

    const token = authHeader.replace("Bearer ", "");

    try{
        const decode = verifyToken(token) as JwtPayload & {id: number, email: string};
        return decode;
    }catch(err){
        throw new Error("Token khong dung");
    }
}
