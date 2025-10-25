import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const showcaseImages = [
  {
    id: "cmh5yy21v0003ng0750hos1qy",
    rasterImageUrl: "/showcase/1761377917278-illustration-yo-az-07.jpg",
    svgUrl: "/showcase/1761377917278-illustration-yo-az-07.svg",
    filename: "illustration-yo-az-07.jpg",
    displayOrder: 1
  },
  {
    id: "cmh5yzx9f0004ng07hd59s113",
    rasterImageUrl: "/showcase/1761378008983-typography-tenczynski-14.jpg",
    svgUrl: "/showcase/1761378008983-typography-tenczynski-14.svg",
    filename: "typography-tenczynski-14.jpg",
    displayOrder: 2
  },
  {
    id: "cmh5z2jw30005ng07xegx0p67",
    rasterImageUrl: "/showcase/1761378123792-lettering-danii-pollehn-06.jpg",
    svgUrl: "/showcase/1761378123792-lettering-danii-pollehn-06.svg",
    filename: "lettering-danii-pollehn-06.jpg",
    displayOrder: 3
  },
  {
    id: "cmh5z36gb0006ng07esxplfa5",
    rasterImageUrl: "/showcase/1761378164667-typography-axel-vincent-11.jpg",
    svgUrl: "/showcase/1761378164667-typography-axel-vincent-11.svg",
    filename: "typography-axel-vincent-11.jpg",
    displayOrder: 4
  },
  {
    id: "cmh5z7qn90008ng074yo01s00",
    rasterImageUrl: "/showcase/1761378370646-illustration-sam-peet-07.jpg",
    svgUrl: "/showcase/1761378370646-illustration-sam-peet-07.svg",
    filename: "illustration-sam-peet-07.jpg",
    displayOrder: 6
  }
];

async function main() {
  console.log('Starting showcase images migration...');

  for (const image of showcaseImages) {
    try {
      const result = await prisma.showcaseImage.upsert({
        where: { id: image.id },
        update: {
          rasterImageUrl: image.rasterImageUrl,
          svgUrl: image.svgUrl,
          filename: image.filename,
          displayOrder: image.displayOrder,
        },
        create: image,
      });
      console.log(`✓ Migrated: ${result.filename}`);
    } catch (error) {
      console.error(`✗ Failed to migrate ${image.filename}:`, error);
    }
  }

  console.log('\nMigration complete!');

  // Verify
  const count = await prisma.showcaseImage.count();
  console.log(`Total showcase images in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
