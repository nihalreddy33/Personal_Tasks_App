import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads / serverless invocations.
// This uses a direct Prisma Postgres connection (the DATABASE_URL from the
// Vercel Storage tab). If you later switch to the Accelerate URL
// (prisma+postgres://accelerate.prisma-data.net/?api_key=...) for pooled
// serverless access, add the @prisma/extension-accelerate extension here.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
