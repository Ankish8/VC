import { prisma } from '../src/lib/db';

async function setupPlans() {
  console.log('Setting up PayPal subscription plans...');

  const settings = await prisma.siteSettings.findFirst();

  if (settings) {
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        starterMonthlyPlanId: 'P-STARTER-MONTHLY',
        starterYearlyPlanId: 'P-STARTER-YEARLY',
        proMonthlyPlanId: 'P-PRO-MONTHLY',
        proYearlyPlanId: 'P-PRO-YEARLY',
      },
    });
    console.log('✓ Plan IDs updated successfully');
  } else {
    await prisma.siteSettings.create({
      data: {
        starterMonthlyPrice: 10.00,
        starterYearlyPrice: 96.00,
        proMonthlyPrice: 19.00,
        proYearlyPrice: 180.00,
        lifetimePrice: 39.00,
        starterCredits: 100,
        proCredits: 500,
        starterMonthlyPlanId: 'P-STARTER-MONTHLY',
        starterYearlyPlanId: 'P-STARTER-YEARLY',
        proMonthlyPlanId: 'P-PRO-MONTHLY',
        proYearlyPlanId: 'P-PRO-YEARLY',
      },
    });
    console.log('✓ Settings created with plan IDs');
  }

  const updatedSettings = await prisma.siteSettings.findFirst();
  console.log('\nCurrent Plan IDs:');
  console.log('  Starter Monthly:', updatedSettings?.starterMonthlyPlanId);
  console.log('  Starter Yearly:', updatedSettings?.starterYearlyPlanId);
  console.log('  Pro Monthly:', updatedSettings?.proMonthlyPlanId);
  console.log('  Pro Yearly:', updatedSettings?.proYearlyPlanId);

  console.log('\n⚠️  IMPORTANT: Replace these placeholder plan IDs with real PayPal plan IDs from your PayPal dashboard');
  console.log('   Go to /admin/pricing to update them with actual PayPal plan IDs\n');
}

setupPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
