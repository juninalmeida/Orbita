import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@orbita.com'
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is required.')
    console.error('Usage: ADMIN_PASSWORD=YourSecurePass123 npx ts-node prisma/seed-admin.ts')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role !== 'admin') {
      await prisma.user.update({
        where: { email },
        data: { role: 'admin' },
      })
      console.log(`User ${email} updated to admin role.`)
    } else {
      console.log(`Admin user ${email} already exists.`)
    }
    return
  }

  const password = await hash(adminPassword, 12)

  await prisma.user.create({
    data: {
      name: 'Admin Orbita',
      email,
      password,
      role: 'admin',
    },
  })

  console.log('Admin user created successfully!')
  console.log(`Email: ${email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
