const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Products featured count:', await prisma.product.count({where: {isFeatured: true}}));
  console.log('Categories featured count:', await prisma.category.count({where: {isFeatured: true}}));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
