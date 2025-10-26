/**
 * Test script to verify Facebook Conversions API payload structure
 * Run with: node test-facebook-payload.js
 */

// Sample event payload matching the required structure
const sampleEvent = {
  data: [
    {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `${Date.now()}-test`,
      event_source_url: "https://thevectorcraft.com",
      action_source: "website",
      user_data: {
        em: [
          "7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068" // hashed email
        ],
        ph: [null], // No phone provided
        external_id: ["hashed-user-id-123"],
        client_ip_address: "192.168.1.1",
        client_user_agent: "Mozilla/5.0...",
        fbc: "fb.1.123456789.AbCdEfGhIj",
        fbp: "fb.1.123456789.987654321"
      },
      attribution_data: {
        attribution_share: "1.0"
      },
      custom_data: {
        currency: "USD",
        value: "142.52"
      },
      original_event_data: {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000)
      }
    }
  ],
  access_token: "YOUR_ACCESS_TOKEN_HERE"
};

console.log('Facebook Conversions API Payload Structure:\n');
console.log(JSON.stringify(sampleEvent, null, 2));

console.log('\n✅ Payload Structure Checklist:');
console.log('  ✓ event_name: string');
console.log('  ✓ event_time: unix timestamp (seconds)');
console.log('  ✓ event_id: unique string for deduplication');
console.log('  ✓ event_source_url: website URL');
console.log('  ✓ action_source: "website"');
console.log('  ✓ user_data.em: array of hashed emails');
console.log('  ✓ user_data.ph: array with null if no phone');
console.log('  ✓ user_data.external_id: array of hashed user IDs');
console.log('  ✓ user_data.client_ip_address: raw IP string');
console.log('  ✓ user_data.client_user_agent: raw user agent string');
console.log('  ✓ user_data.fbc: Facebook click ID cookie');
console.log('  ✓ user_data.fbp: Facebook browser ID cookie');
console.log('  ✓ attribution_data.attribution_share: "1.0"');
console.log('  ✓ custom_data.currency: "USD"');
console.log('  ✓ custom_data.value: string format "142.52"');
console.log('  ✓ original_event_data.event_name: matches event_name');
console.log('  ✓ original_event_data.event_time: matches event_time');

console.log('\n📝 Key Points:');
console.log('  • All PII (email, phone, external_id) must be in array format');
console.log('  • Use [null] for optional PII fields when not available');
console.log('  • Value must be a string, not a number');
console.log('  • Attribution share is typically "1.0" for full attribution');
console.log('  • original_event_data helps with deduplication');
