import { PrismaClient } from '@prisma/client'

/**
 * A single Prisma client per process. In development Next.js hot-reloads
 * modules, which would otherwise spin up a new client (and a new connection
 * pool) on every change and exhaust Neon's connection limit — so we cache the
 * instance on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
