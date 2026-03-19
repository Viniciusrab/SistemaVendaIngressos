import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const result = await prisma.user.updateMany({
    where: { email: 'admin@vinidev.com.br' },
    data: { role: 'ADMIN' }
  })
  console.log('Update result:', result)
}
main()
