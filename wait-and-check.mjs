import { Resend } from 'resend';

const resend = new Resend('re_FAzb8aR4_2SszbytGyAyxw9yaSS6BvuD3');

async function waitAndCheck() {
  // Send a fresh email
  console.log('Sending fresh email...');
  const sendResult = await resend.emails.send({
    from: 'noreply@thevectorcraft.com',
    to: ['hsiknv9@gmail.com'],
    subject: 'Test ' + new Date().toISOString(),
    html: '<h1>Test</h1>',
  });

  console.log('Send result:', JSON.stringify(sendResult, null, 2));

  if (!sendResult.data?.id) {
    console.log('No email ID returned, stopping.');
    return;
  }

  const emailId = sendResult.data.id;
  console.log(`\nEmail ID: ${emailId}`);
  console.log('Waiting 30 seconds before checking...\n');

  // Check every 5 seconds for 30 seconds
  for (let i = 1; i <= 6; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log(`Check ${i}/6 (after ${i * 5} seconds):`);

    try {
      const emailDetails = await resend.emails.get(emailId);
      console.log(JSON.stringify(emailDetails, null, 2));

      if (emailDetails.data) {
        console.log('\n✅ Email found!');
        break;
      }
    } catch (error) {
      console.log('Still not found...');
    }
  }

  // Final list check
  console.log('\n=== Listing all recent emails ===');
  const list = await resend.emails.list({ limit: 10 });
  console.log(JSON.stringify(list, null, 2));
}

waitAndCheck();
