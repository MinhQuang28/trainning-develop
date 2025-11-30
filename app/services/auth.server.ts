import prisma from "../lib/db";
import bcrypt from "bcryptjs";


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
