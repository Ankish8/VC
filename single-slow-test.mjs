import { Resend } from 'resend';

const resend = new Resend('re_FAzb8aR4_2SszbytGyAyxw9yaSS6BvuD3');

async function singleTest() {
  console.log('Sending ONE email slowly and carefully...\n');

  // Wait 5 seconds first to ensure we're not rate limited
  console.log('Waiting 5 seconds to avoid rate limit...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Sending email now...\n');

  try {
    const result = await resend.emails.send({
      from: 'VectorCraft <noreply@thevectorcraft.com>',
      to: ['hsiknv9@gmail.com'],
      subject: 'Single Test - ' + new Date().toISOString(),
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Single Test Email</h1>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </body>
        </html>
      `,
    });

    console.log('Send result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.data?.id) {
      console.log(`\n✅ Email ID: ${result.data.id}`);
      console.log(`Direct link: https://resend.com/emails/${result.data.id}`);

      // Wait 10 seconds
      console.log('\nWaiting 10 seconds before checking...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Check if it appears in list
      console.log('\nChecking email list...');
      const list = await resend.emails.list({ limit: 10 });

      if (list.data?.data) {
        console.log(`Total emails in account: ${list.data.data.length}`);
        const found = list.data.data.find(e => e.id === result.data.id);

        if (found) {
          console.log('\n✅ EMAIL FOUND IN LIST!');
          console.log(JSON.stringify(found, null, 2));
        } else {
          console.log('\n❌ EMAIL NOT IN LIST');
          console.log('Latest email in list:');
          console.log(JSON.stringify(list.data.data[0], null, 2));
        }
      }

      // Try to get the specific email
      console.log('\nTrying to fetch email by ID...');
      const emailDetails = await resend.emails.get(result.data.id);
      console.log(JSON.stringify(emailDetails, null, 2));

    } else if (result.error) {
      console.log('\n❌ Error returned:', result.error);
    }

  } catch (error) {
    console.log('\n❌ Exception thrown:', error);
  }
}

singleTest();
