import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

async function verify() {
  const emailId = 'ab22bdc7-3789-4fd4-8470-e02d3019b065';

  console.log('Checking email ID:', emailId);

  try {
    const email = await resend.emails.get(emailId);
    console.log('✅ Email found in Resend!');
    console.log(JSON.stringify(email.data, null, 2));
  } catch (error) {
    console.log('❌ Not found:', error.message);
  }
}

verify();
