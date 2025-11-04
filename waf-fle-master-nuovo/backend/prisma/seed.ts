import { PrismaClient } from '@prisma/client';

import argon2 from 'argon2';

 

const prisma = new PrismaClient();

 

async function main() {

  console.log('🌱 Seeding database...');

 

  // Controlla se esiste già un admin

  const existingAdmin = await prisma.user.findFirst({

    where: { role: 'ADMIN' }

  });

 

  if (existingAdmin) {

    console.log('✅ Admin user already exists, skipping seed');

    return;

  }

 

  // Crea admin di default

  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  const hashedPassword = await argon2.hash(defaultPassword, {

    type: argon2.argon2id,

    memoryCost: 65536,

    timeCost: 3,

    parallelism: 1

  });

 

  const admin = await prisma.user.create({

    data: {

      username: 'admin',

      password: hashedPassword,

      role: 'ADMIN'

    }

  });

 

  console.log('✅ Admin user created:');

  console.log(`   Username: ${admin.username}`);

  console.log(`   Password: ${defaultPassword}`);

  console.log('');

  console.log('⚠️  IMPORTANT: Change this password immediately after first login!');

}

 

main()

  .catch((e) => {

    console.error('❌ Seed error:', e);

    process.exit(1);

  })

  .finally(async () => {

    await prisma.$disconnect();

  });