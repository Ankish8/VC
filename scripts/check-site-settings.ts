import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking SiteSettings...\n');

  const settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    console.log('❌ No SiteSettings record found');
    console.log('Creating initial SiteSettings record...');

    const newSettings = await prisma.siteSettings.create({
      data: {
        paypalMode: 'sandbox',
      },
    });

    console.log('✅ Created SiteSettings:', newSettings.id);
  } else {
    console.log('✅ SiteSettings found:', settings.id);
    console.log('\nCurrent PayPal Config:');
    console.log('  Mode:', settings.paypalMode);
    console.log('  Sandbox Client ID:', settings.paypalSandboxClientId ? '✓ Set' : '✗ Not set');
    console.log('  Sandbox Secret:', settings.paypalSandboxSecret ? '✓ Set' : '✗ Not set');
    console.log('  Live Client ID:', settings.paypalLiveClientId ? '✓ Set' : '✗ Not set');
    console.log('  Live Secret:', settings.paypalLiveSecret ? '✓ Set' : '✗ Not set');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
