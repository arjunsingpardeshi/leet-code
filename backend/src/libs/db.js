
import {PrismaClient} from "../generated/prisma/index.js";

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;



// setInterval(async () => {
//   try {
//     await db.$queryRaw`SELECT 1`;
//     console.log("Pinged DB to keep it awake");
//   } catch (err) {
//     console.log("DB ping failed", err);
//   }
// }, 2 * 60 * 1000); // every 2 minutes
