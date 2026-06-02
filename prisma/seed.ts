/**
 * Idempotent database seed.
 *
 * Phase 0 is a no-op placeholder. Phase 2 seeds the launch categories, a few
 * learning paths, a controlled admin user, and challenges with *placeholder*
 * flag hashes (never real flags in source). Re-running must never duplicate
 * rows — use `upsert` keyed on natural unique fields.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[seed] nothing to seed yet — content lands in Phase 2 (see docs/SCHEMA.md).')
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
