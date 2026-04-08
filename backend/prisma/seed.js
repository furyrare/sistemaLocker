const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.pickupLog.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.compartment.deleteMany();
  await prisma.locker.deleteMany();

  const lockers = [
    {
      name: 'Locker JF',
      location: 'Recepção',
      compartments: [
        ...Array.from({ length: 6 }).map((_, i) => ({ number: i + 1, size: 'SMALL', status: 'AVAILABLE' })),
        ...Array.from({ length: 4 }).map((_, i) => ({ number: 100 + i + 1, size: 'MEDIUM', status: 'AVAILABLE' })),
        ...Array.from({ length: 2 }).map((_, i) => ({ number: 200 + i + 1, size: 'LARGE', status: 'AVAILABLE' }))
      ]
    },
    {
      name: 'Locker BH',
      location: 'Portaria',
      compartments: [
        ...Array.from({ length: 8 }).map((_, i) => ({ number: i + 1, size: 'SMALL', status: 'AVAILABLE' })),
        ...Array.from({ length: 4 }).map((_, i) => ({ number: 100 + i + 1, size: 'MEDIUM', status: 'AVAILABLE' }))
      ]
    }
  ];

  for (const l of lockers) {
    await prisma.locker.create({
      data: {
        name: l.name,
        location: l.location,
        compartments: {
          create: l.compartments
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
