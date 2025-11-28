import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
console.log('🚀 ~ process.env.DATABASE_URL:', process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        message: {
            async create({ args, query }) {
                const result = await query(args);

                await prisma.conversation.update({
                    where: { id: args.data.conversationId },
                    data: { updatedAt: new Date() }
                });

                return result;
            }
        },
        users: {
            async create({ args, query }) {
                args.data.password = await bcrypt.hash(args.data.password, 10);
                const result = await query(args);

                return result;
            }
        }
    }
});

export default prisma;
