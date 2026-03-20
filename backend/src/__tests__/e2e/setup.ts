import { PrismaClient } from '@prisma/client'

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://orbita:orbita@localhost:5432/orbita_test'

// Override DATABASE_URL before any app import resolves it
process.env.DATABASE_URL = TEST_DATABASE_URL
process.env.NODE_ENV = 'test'

const prismaTest = new PrismaClient({
  datasources: { db: { url: TEST_DATABASE_URL } },
})

const tables = [
  'task_assignments',
  'tasks_history',
  'task_requests',
  'tasks',
  'team_members',
  'teams',
  'users',
]

export async function cleanDatabase() {
  for (const table of tables) {
    await prismaTest.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`)
  }
}

export async function disconnectDatabase() {
  await prismaTest.$disconnect()
}

export { prismaTest }
