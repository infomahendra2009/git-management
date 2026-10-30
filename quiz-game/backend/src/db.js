// Single data-access entry point. Keep all queries going through this client
// so multi-tenancy can be added later in one place.
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
