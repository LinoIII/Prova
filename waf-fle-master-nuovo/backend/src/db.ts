import { PrismaClient } from '@prisma/client';

 

// Singleton PrismaClient per evitare multiple istanze

let prisma: PrismaClient;

 

declare global {

  // eslint-disable-next-line no-var

  var __prisma: PrismaClient | undefined;

}

 

if (process.env.NODE_ENV === 'production') {

  prisma = new PrismaClient();

} else {

  // In development, riutilizza istanza tra hot-reloads

  if (!global.__prisma) {

    global.__prisma = new PrismaClient();

  }

  prisma = global.__prisma;

}

 

export { prisma };