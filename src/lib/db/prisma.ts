import { PrismaClient } from '@prisma/client';

// Déclaration pour éviter les erreurs TypeScript
declare global {
  var prisma: PrismaClient | undefined;
}

// Éviter de créer plusieurs instances de PrismaClient en développement
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
