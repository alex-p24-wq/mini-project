import dotenv from 'dotenv';
import { sendHubArrivalOTPEmail } from './utils/emailService.js';

dotenv.config();

console.log('🧪 Testing OTP Email Sending...\n');
console.log('Environment Variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  FORCE_DEV_EMAIL:', process.env.FORCE_DEV_EMAIL);
console.log('  USE_GMAIL:', process.env.USE_GMAIL);
console.log('  SMTP_USER:', process.env.SMTP_USER);
console.log('  SMTP_PORT:', process.env.SMTP_PORT);
console.log('  MAIL_FROM:', process.env.MAIL_FROM);
console.log('\n');

// Test email sending
const testEmail = async () => {
  try {
    console.log('📧 Sending test OTP email...\n');
    
    const result = await sendHubArrivalOTPEmail(
      'alexantony2026@mca.ajce.in', // Test email (replace with actual farmer email)
      'Test Farmer',
      '123456',
      'Premium Cardamom Grade A'
    );
    
    console.log('\n📊 Result:', result);
    
    if (result.success) {
      console.log('\n✅ SUCCESS! OTP email was sent successfully!');
      console.log('   Check the inbox of:', 'alexantony2026@mca.ajce.in');
    } else {
      console.log('\n❌ FAILED! Email was not sent.');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.error('\n❌ EXCEPTION:', error);
  }
  
  process.exit(0);
};

testEmail();
