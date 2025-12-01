import { prisma } from "~/utils/prisma";
import bcrypt from "bcryptjs";

export async function register({ email, password, name }: any) {
  const existingAuth = await prisma.auth.findUnique({ where: { email } });
  if (existingAuth) {
    throw new Error("Email này đã được sử dụng");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      auth: {
        create: {
          email,
          password: hashedPassword,
        },
      },
    },
  });
  return user;
}

export async function login({ email, password }: any) {
  const authAccount = await prisma.auth.findUnique({
    where: { email },
    include: { user: true }, 
  });

  if (!authAccount) return null;

  const isCorrectPassword = await bcrypt.compare(password, authAccount.password);
  if (!isCorrectPassword) return null;
  return {
      id: authAccount.user.id,
      email: authAccount.email,
      name: authAccount.user.name
  };
}