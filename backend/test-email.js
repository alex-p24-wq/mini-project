import dotenv from 'dotenv';
import { verifyEmailConfig, sendProductSoldEmail, sendPaymentReceivedEmail } from './utils/emailService.js';

dotenv.config();

// Test email functionality
const testEmailService = async () => {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Verify email configuration
  console.log('1️⃣ Testing email configuration...');
  const configValid = await verifyEmailConfig();
  console.log(`Email config valid: ${configValid ? '✅' : '❌'}\n`);

  if (!configValid) {
    console.log('❌ Email configuration failed. Please check your .env file.');
    return;
  }

  // Test 2: Send product sold email
  console.log('2️⃣ Testing product sold email...');
  const testOrderData = {
    productName: 'Premium Cardamom',
    customerName: 'John Doe',
    quantity: 5,
    amount: 2500,
    orderId: '507f1f77bcf86cd799439011',
    orderIdShort: 'ORD123',
    productId: '507f1f77bcf86cd799439012',
    customerId: '507f1f77bcf86cd799439013'
  };

  const productSoldResult = await sendProductSoldEmail(
    'alexantony2026@mca.ajce.in', // Test email
    'Test Farmer',
    testOrderData
  );

  console.log(`Product sold email: ${productSoldResult.success ? '✅ Sent' : '❌ Failed'}`);
  if (!productSoldResult.success) {
    console.log('Error:', productSoldResult.error);
  }
  console.log('');

  // Test 3: Send payment received email
  console.log('3️⃣ Testing payment received email...');
  const paymentReceivedResult = await sendPaymentReceivedEmail(
    'alexantony2026@mca.ajce.in', // Test email
    'Test Farmer',
    testOrderData
  );

  console.log(`Payment received email: ${paymentReceivedResult.success ? '✅ Sent' : '❌ Failed'}`);
  if (!paymentReceivedResult.success) {
    console.log('Error:', paymentReceivedResult.error);
  }
  console.log('');

  console.log('🎉 Email service testing completed!');
  console.log('\n📧 Check your email inbox for test notifications.');
};

// Run the test
testEmailService().catch(console.error);
