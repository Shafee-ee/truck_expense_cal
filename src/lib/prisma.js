import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

console.log("Prisma client created", {
  log: ["warn", "error"],
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
