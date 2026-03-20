import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@orbita.com'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Update to admin if not already
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

  const password = await hash('admin123', 8)

  await prisma.user.create({
    data: {
      name: 'Admin Orbita',
      email,
      password,
      role: 'admin',
    },
  })

  console.log('Admin user created successfully!')
  console.log('Email: admin@orbita.com')
  console.log('Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
