import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = '123';
  
  // Verifica se já existe algum usuário admin
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  });

  if (!existingAdmin) {
    console.log('Criando usuário administrador inicial...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.create({
      data: {
        name: 'Administrador vinidev',
        email: adminEmail,
        cpf: '00000000000',
        phone: '00000000000',
        password_hash: hashedPassword,
        role: 'ADMIN',
      }
    });
    console.log(`Admin criado: ${adminEmail} | senha: ${adminPassword}`);
  } else {
    console.log('Administrador já existe no banco de dados. Pulando seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
