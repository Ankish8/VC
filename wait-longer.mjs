import { Resend } from 'resend';

const resend = new Resend('re_FAzb8aR4_2SszbytGyAyxw9yaSS6BvuD3');

async function waitAndCheck() {
  console.log('Checking email list every 10 seconds for 1 minute...\n');

  const emailIds = [
    '5e629d90-e638-4d90-adde-e027029699a2',
    '4eecb047-c73d-452e-a6b4-313de5b5b696'
  ];

  for (let i = 1; i <= 6; i++) {
    console.log(`Check ${i}/6 (${i * 10} seconds elapsed):`);

    const list = await resend.emails.list({ limit: 20 });
    console.log(`  Total emails in list: ${list.data?.data?.length || 0}`);

    if (list.data?.data) {
      for (const emailId of emailIds) {
        const found = list.data.data.find(e => e.id === emailId);
        console.log(`  Email ${emailId}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
      }
    }

    if (i < 6) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

waitAndCheck();
