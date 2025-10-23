import { prisma } from '../src/lib/db';
import { createSubscriptionPlan } from '../src/lib/paypal';

async function createAllPlans() {
  console.log('Creating PayPal subscription plans...\n');

  // Get current pricing from database
  const settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    console.error('❌ No site settings found. Run npm run db:push first.');
    return;
  }

  try {
    // Create Starter Monthly Plan
    console.log('Creating Starter Monthly plan...');
    const starterMonthly = await createSubscriptionPlan({
      name: 'VectorCraft Starter - Monthly',
      description: `${settings.starterCredits} conversions per month`,
      amount: settings.starterMonthlyPrice.toFixed(2),
      currency: 'USD',
      interval: 'MONTH',
    });
    console.log(`✓ Created: ${starterMonthly.id}\n`);

    // Create Starter Yearly Plan
    console.log('Creating Starter Yearly plan...');
    const starterYearly = await createSubscriptionPlan({
      name: 'VectorCraft Starter - Yearly',
      description: `${settings.starterCredits} conversions per month (20% discount)`,
      amount: settings.starterYearlyPrice.toFixed(2),
      currency: 'USD',
      interval: 'YEAR',
    });
    console.log(`✓ Created: ${starterYearly.id}\n`);

    // Create Pro Monthly Plan
    console.log('Creating Professional Monthly plan...');
    const proMonthly = await createSubscriptionPlan({
      name: 'VectorCraft Professional - Monthly',
      description: `${settings.proCredits} conversions per month`,
      amount: settings.proMonthlyPrice.toFixed(2),
      currency: 'USD',
      interval: 'MONTH',
    });
    console.log(`✓ Created: ${proMonthly.id}\n`);

    // Create Pro Yearly Plan
    console.log('Creating Professional Yearly plan...');
    const proYearly = await createSubscriptionPlan({
      name: 'VectorCraft Professional - Yearly',
      description: `${settings.proCredits} conversions per month (20% discount)`,
      amount: settings.proYearlyPrice.toFixed(2),
      currency: 'USD',
      interval: 'YEAR',
    });
    console.log(`✓ Created: ${proYearly.id}\n`);

    // Update database with plan IDs
    console.log('Updating database with plan IDs...');
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        starterMonthlyPlanId: starterMonthly.id,
        starterYearlyPlanId: starterYearly.id,
        proMonthlyPlanId: proMonthly.id,
        proYearlyPlanId: proYearly.id,
      },
    });

    console.log('✓ Database updated\n');
    console.log('========================================');
    console.log('All PayPal subscription plans created!');
    console.log('========================================\n');
    console.log('Plan IDs:');
    console.log(`  Starter Monthly: ${starterMonthly.id}`);
    console.log(`  Starter Yearly:  ${starterYearly.id}`);
    console.log(`  Pro Monthly:     ${proMonthly.id}`);
    console.log(`  Pro Yearly:      ${proYearly.id}\n`);
    console.log('These have been saved to your database.');
    console.log('Your subscription system is now ready to use!\n');

  } catch (error: any) {
    console.error('\n❌ Error creating PayPal plans:');
    console.error(error.message);
    console.error('\nMake sure you have set the following environment variables:');
    console.error('  - PAYPAL_CLIENT_ID');
    console.error('  - PAYPAL_CLIENT_SECRET');
    console.error('  - PAYPAL_MODE (sandbox or live)');
    console.error('\nIf you need a PAYPAL_PRODUCT_ID, add it to your .env file.\n');
  }
}

createAllPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
