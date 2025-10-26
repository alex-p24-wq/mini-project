import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter based on configuration
const createTransporter = () => {
  if (process.env.USE_GMAIL === 'true') {
    return nodemailer.createTransport({
      service: 'gmail',
      secure: process.env.SMTP_SECURE === 'true',
      port: parseInt(process.env.SMTP_PORT) || 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
};

const transporter = createTransporter();

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    return false;
  }
};

// Send email function
export const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    console.log(`📧 [sendEmail] Starting email send process...`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   FORCE_DEV_EMAIL: ${process.env.FORCE_DEV_EMAIL}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    // Skip email sending in test environment or if email is disabled
    if (process.env.NODE_ENV === 'test' || process.env.FORCE_DEV_EMAIL === 'true') {
      console.log('⚠️ [sendEmail] DEV MODE - Email NOT actually sent (logged only)');
      console.log('📧 Email would be sent to:', to);
      console.log('📧 Subject:', subject);
      console.log('📧 Content:', textContent || htmlContent.substring(0, 200));
      return { success: true, messageId: 'test-message-id' };
    }

    console.log(`📧 [sendEmail] Preparing mail options...`);
    const mailOptions = {
      from: `"E-Cardamom Connect" <${process.env.MAIL_FROM}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent
    };
    
    console.log(`📧 [sendEmail] Mail from: ${mailOptions.from}`);
    console.log(`📧 [sendEmail] Sending via transporter...`);

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ [sendEmail] Email sent successfully to:', to);
    console.log('📧 [sendEmail] Message ID:', result.messageId);
    console.log('📧 [sendEmail] Response:', result.response);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ [sendEmail] Error sending email to:', to);
    console.error('❌ [sendEmail] Error message:', error.message);
    console.error('❌ [sendEmail] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  // Product sold notification email
  productSoldEmail: (farmerName, orderData) => {
    const subject = `🎉 Your ${orderData.productName} has been sold!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Sold - E-Cardamom Connect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2E7D32, #4CAF50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #2E7D32; }
          .detail-value { color: #333; }
          .amount { font-size: 24px; font-weight: bold; color: #2E7D32; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1>Congratulations!</h1>
            <p>Your product has been sold successfully</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${farmerName}</strong>,</p>
            
            <p>Great news! Your cardamom product has been purchased by a customer. Here are the order details:</p>
            
            <div class="order-details">
              <h3>📦 Order Details</h3>
              <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">${orderData.productName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${orderData.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${orderData.quantity} kg</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">#${orderData.orderIdShort}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            
            <div class="amount">
              💰 Order Value: ₹${orderData.amount.toLocaleString('en-IN')}
            </div>
            
            <p>The customer will proceed with payment, and you'll receive another notification once the payment is confirmed.</p>
            
            <p>Thank you for being a valued farmer on E-Cardamom Connect!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from E-Cardamom Connect</p>
            <p>© 2024 E-Cardamom Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Congratulations ${farmerName}!

Your ${orderData.productName} has been sold to ${orderData.customerName}.

Order Details:
- Product: ${orderData.productName}
- Customer: ${orderData.customerName}
- Quantity: ${orderData.quantity} kg
- Order Value: ₹${orderData.amount.toLocaleString('en-IN')}
- Order ID: #${orderData.orderIdShort}
- Order Date: ${new Date().toLocaleDateString('en-IN')}

You'll receive another notification once the payment is confirmed.

Thank you for being a valued farmer on E-Cardamom Connect!

This is an automated notification from E-Cardamom Connect.
    `;
    
    return { subject, html, text };
  },

  // OTP for hub arrival confirmation (to farmer)
  hubArrivalOTPEmail: (farmerName, otp, productName) => {
    const subject = `🔐 OTP for Hub Arrival Confirmation - ${otp}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hub Arrival OTP - E-Cardamom Connect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-icon { font-size: 48px; margin-bottom: 10px; }
          .otp-box { background: white; padding: 30px; border-radius: 12px; margin: 25px 0; border: 2px solid #6366f1; text-align: center; }
          .otp-code { font-size: 42px; font-weight: bold; color: #6366f1; letter-spacing: 8px; font-family: monospace; margin: 15px 0; }
          .warning-box { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .info-text { color: #6b7280; font-size: 14px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="otp-icon">🔐</div>
            <h1>Hub Arrival Confirmation</h1>
            <p>Your OTP for Product Verification</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${farmerName}</strong>,</p>
            
            <p>You have requested to confirm the arrival of your product <strong>${productName}</strong> at the hub.</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600;">YOUR OTP CODE</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 10 minutes</p>
            </div>
            
            <div class="warning-box">
              <p style="margin: 0; font-weight: 600; color: #92400e;">⚠️ Important:</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this OTP with anyone</li>
                <li>Use this OTP only on the E-Cardamom Connect platform</li>
              </ul>
            </div>
            
            <p class="info-text">Once you verify this OTP, the customer will be automatically notified that the product has arrived at the hub and is ready for delivery.</p>
            
            <p class="info-text">If you did not request this OTP, please ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from E-Cardamom Connect</p>
            <p>© 2024 E-Cardamom Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Hub Arrival Confirmation OTP

Dear ${farmerName},

You have requested to confirm the arrival of your product "${productName}" at the hub.

YOUR OTP CODE: ${otp}

Valid for: 10 minutes

IMPORTANT:
- This OTP is valid for 10 minutes only
- Do not share this OTP with anyone
- Use this OTP only on the E-Cardamom Connect platform

Once you verify this OTP, the customer will be automatically notified that the product has arrived at the hub and is ready for delivery.

If you did not request this OTP, please ignore this email.

This is an automated notification from E-Cardamom Connect.
    `;
    
    return { subject, html, text };
  },

  // Product arrived at hub notification email (to customer)
  productArrivedAtHubEmail: (customerName, orderData) => {
    const subject = `📦 Your Order has Arrived at the Hub - Ready for Delivery!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Arrived at Hub - E-Cardamom Connect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #0ea5e9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .hub-icon { font-size: 48px; margin-bottom: 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #6366f1; }
          .detail-value { color: #333; }
          .status-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .info-box { background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="hub-icon">🏢</div>
            <h1>Product Arrived at Hub!</h1>
            <p>Your order is ready for delivery</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${customerName}</strong>,</p>
            
            <p>Great news! Your cardamom order has successfully arrived at our hub and has been confirmed by the farmer.</p>
            
            <div style="text-align: center;">
              <span class="status-badge">✅ Confirmed at Hub</span>
            </div>
            
            <div class="order-details">
              <h3>📦 Order Details</h3>
              <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">${orderData.productName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Farmer:</span>
                <span class="detail-value">${orderData.farmerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${orderData.quantity} kg</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">#${orderData.orderIdShort}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hub Location:</span>
                <span class="detail-value">${orderData.hubLocation || 'Kerala Hub'}</span>
              </div>
            </div>
            
            <div class="info-box">
              <h4>🚚 What's Next?</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Your order is now being prepared for dispatch</li>
                <li>You'll receive tracking information once shipped</li>
                <li>Expected delivery within 2-3 business days</li>
              </ul>
            </div>
            
            <p>Thank you for choosing E-Cardamom Connect for your premium cardamom needs!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from E-Cardamom Connect</p>
            <p>© 2024 E-Cardamom Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Product Arrived at Hub!

Dear ${customerName},

Great news! Your cardamom order has successfully arrived at our hub and has been confirmed by the farmer.

Order Details:
- Product: ${orderData.productName}
- Farmer: ${orderData.farmerName}
- Quantity: ${orderData.quantity} kg
- Order ID: #${orderData.orderIdShort}
- Hub Location: ${orderData.hubLocation || 'Kerala Hub'}
- Status: ✅ Confirmed at Hub

What's Next?
- Your order is now being prepared for dispatch
- You'll receive tracking information once shipped
- Expected delivery within 2-3 business days

Thank you for choosing E-Cardamom Connect for your premium cardamom needs!

This is an automated notification from E-Cardamom Connect.
    `;
    
    return { subject, html, text };
  },

  // Payment received notification email
  paymentReceivedEmail: (farmerName, orderData) => {
    const subject = `💳 Payment Received - ₹${orderData.amount.toLocaleString('en-IN')}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Received - E-Cardamom Connect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1976D2, #42A5F5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payment-icon { font-size: 48px; margin-bottom: 10px; }
          .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976D2; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #1976D2; }
          .detail-value { color: #333; }
          .amount { font-size: 28px; font-weight: bold; color: #1976D2; text-align: center; margin: 20px 0; padding: 20px; background: #E3F2FD; border-radius: 8px; }
          .success-message { background: #E8F5E8; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="payment-icon">💳</div>
            <h1>Payment Received!</h1>
            <p>Your earnings have been confirmed</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${farmerName}</strong>,</p>
            
            <div class="success-message">
              <h3>🎉 Great News!</h3>
              <p>The payment for your cardamom order has been successfully received and confirmed.</p>
            </div>
            
            <div class="amount">
              💰 Amount Received: ₹${orderData.amount.toLocaleString('en-IN')}
            </div>
            
            <div class="payment-details">
              <h3>💳 Payment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">${orderData.productName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${orderData.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${orderData.quantity} kg</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">#${orderData.orderIdShort}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value" style="color: #4CAF50; font-weight: bold;">✅ Confirmed</span>
              </div>
            </div>
            
            <p>The payment has been processed successfully. You can now prepare the cardamom for delivery to the customer.</p>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Prepare your cardamom for packaging</li>
              <li>Ensure quality standards are met</li>
              <li>Wait for pickup/delivery coordination</li>
            </ul>
            
            <p>Thank you for your business with E-Cardamom Connect!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from E-Cardamom Connect</p>
            <p>© 2024 E-Cardamom Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Payment Received!

Dear ${farmerName},

Great news! The payment for your cardamom order has been successfully received and confirmed.

Amount Received: ₹${orderData.amount.toLocaleString('en-IN')}

Payment Details:
- Product: ${orderData.productName}
- Customer: ${orderData.customerName}
- Quantity: ${orderData.quantity} kg
- Order ID: #${orderData.orderIdShort}
- Payment Date: ${new Date().toLocaleDateString('en-IN')}
- Payment Status: ✅ Confirmed

The payment has been processed successfully. You can now prepare the cardamom for delivery to the customer.

Next Steps:
- Prepare your cardamom for packaging
- Ensure quality standards are met
- Wait for pickup/delivery coordination

Thank you for your business with E-Cardamom Connect!

This is an automated notification from E-Cardamom Connect.
    `;
    
    return { subject, html, text };
  }
};

// Send product sold email
export const sendProductSoldEmail = async (farmerEmail, farmerName, orderData) => {
  try {
    const { subject, html, text } = emailTemplates.productSoldEmail(farmerName, orderData);
    return await sendEmail(farmerEmail, subject, html, text);
  } catch (error) {
    console.error('Error sending product sold email:', error);
    return { success: false, error: error.message };
  }
};

// Send payment received email
export const sendPaymentReceivedEmail = async (farmerEmail, farmerName, orderData) => {
  try {
    const { subject, html, text } = emailTemplates.paymentReceivedEmail(farmerName, orderData);
    return await sendEmail(farmerEmail, subject, html, text);
  } catch (error) {
    console.error('Error sending payment received email:', error);
    return { success: false, error: error.message };
  }
};

// Send product arrived at hub email to customer
export const sendProductArrivedAtHubEmail = async (customerEmail, customerName, orderData) => {
  try {
    const { subject, html, text } = emailTemplates.productArrivedAtHubEmail(customerName, orderData);
    return await sendEmail(customerEmail, subject, html, text);
  } catch (error) {
    console.error('Error sending product arrived at hub email:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email to farmer for hub arrival confirmation
export const sendHubArrivalOTPEmail = async (farmerEmail, farmerName, otp, productName) => {
  try {
    console.log(`📧 [sendHubArrivalOTPEmail] Preparing email...`);
    console.log(`   To: ${farmerEmail}`);
    console.log(`   Farmer: ${farmerName}`);
    console.log(`   Product: ${productName}`);
    console.log(`   OTP: ${otp}`);
    
    const { subject, html, text } = emailTemplates.hubArrivalOTPEmail(farmerName, otp, productName);
    
    console.log(`📧 [sendHubArrivalOTPEmail] Calling sendEmail...`);
    const result = await sendEmail(farmerEmail, subject, html, text);
    
    console.log(`📧 [sendHubArrivalOTPEmail] Result:`, result);
    return result;
  } catch (error) {
    console.error('❌ [sendHubArrivalOTPEmail] Error:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk product accepted email to farmer
export const sendBulkProductAcceptedEmail = async (farmerEmail, farmerName, productData) => {
  try {
    const subject = `✅ Your Bulk Product Has Been Accepted!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulk Product Accepted - E-Cardamom Connect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .product-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #059669; }
          .detail-value { color: #333; }
          .highlight { background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Congratulations!</h1>
            <p>Your bulk product has been accepted by ${productData.hubName}</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${farmerName}</strong>,</p>
            
            <p>Great news! The hub manager has reviewed and <strong>accepted</strong> your bulk product listing.</p>
            
            <div class="product-details">
              <h3>📦 Product Details</h3>
              <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">${productData.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Grade:</span>
                <span class="detail-value">${productData.grade}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${productData.stock} kg</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Price per kg:</span>
                <span class="detail-value">₹${productData.price}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Value:</span>
                <span class="detail-value">₹${(productData.price * productData.stock).toLocaleString('en-IN')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hub:</span>
                <span class="detail-value">${productData.hubName}</span>
              </div>
            </div>
            
            <div class="highlight">
              <p><strong>🎉 Your product is now live and available for booking!</strong></p>
              <p>Hub managers and buyers can now view and book your product.</p>
            </div>
            
            <p>You will be notified when someone makes an advance payment to book your product.</p>
            
            <p>Thank you for choosing E-Cardamom Connect!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from E-Cardamom Connect</p>
            <p>© 2025 E-Cardamom Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Dear ${farmerName},

Great news! Your bulk product has been ACCEPTED by ${productData.hubName}.

Product Details:
- Product: ${productData.name}
- Grade: ${productData.grade}
- Quantity: ${productData.stock} kg
- Price per kg: ₹${productData.price}
- Total Value: ₹${(productData.price * productData.stock).toLocaleString('en-IN')}
- Hub: ${productData.hubName}

Your product is now live and available for booking!

You will be notified when someone makes an advance payment to book your product.

Thank you for choosing E-Cardamom Connect!

This is an automated notification from E-Cardamom Connect.
    `;
    
    return await sendEmail(farmerEmail, subject, html, text);
  } catch (error) {
    console.error('❌ [sendBulkProductAcceptedEmail] Error:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk product rejected email to farmer
export const sendBulkProductRejectedEmail = async (farmerEmail, farmerName, productData) => {
  try {
    const subject = `❌ Bulk Product Review Update`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulk Product Rejected - E-Cardamom Connect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-icon { font-size: 48px; margin-bottom: 10px; }
          .product-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #dc2626; }
          .detail-value { color: #333; }
          .reason-box { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .actions { background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="warning-icon">⚠️</div>
            <h1>Product Review Update</h1>
            <p>Your bulk product listing was not accepted</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${farmerName}</strong>,</p>
            
            <p>Thank you for submitting your bulk product to ${productData.hubName}. After careful review, the hub manager has decided not to accept this listing at this time.</p>
            
            <div class="product-details">
              <h3>📦 Product Details</h3>
              <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">${productData.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Grade:</span>
                <span class="detail-value">${productData.grade}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${productData.stock} kg</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hub:</span>
                <span class="detail-value">${productData.hubName}</span>
              </div>
            </div>
            
            ${productData.rejectionReason ? `
            <div class="reason-box">
              <h4>📝 Reason for Rejection:</h4>
              <p>${productData.rejectionReason}</p>
            </div>
            ` : ''}
            
            <div class="actions">
              <p><strong>💡 What you can do:</strong></p>
              <ul style="text-align: left; display: inline-block;">
                <li>Review the feedback and make necessary improvements</li>
                <li>Submit a new listing with updated information</li>
                <li>Contact the hub manager for more details</li>
                <li>Try listing with a different hub</li>
              </ul>
            </div>
            
            <p>We appreciate your effort and encourage you to try again. If you have any questions, please contact our support team.</p>
            
            <p>Thank you for your understanding!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from E-Cardamom Connect</p>
            <p>© 2025 E-Cardamom Connect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Dear ${farmerName},

Thank you for submitting your bulk product to ${productData.hubName}. After review, the hub manager has decided not to accept this listing at this time.

Product Details:
- Product: ${productData.name}
- Grade: ${productData.grade}
- Quantity: ${productData.stock} kg
- Hub: ${productData.hubName}

${productData.rejectionReason ? `Reason: ${productData.rejectionReason}\n` : ''}
What you can do:
- Review the feedback and make necessary improvements
- Submit a new listing with updated information
- Contact the hub manager for more details
- Try listing with a different hub

We appreciate your effort and encourage you to try again.

This is an automated notification from E-Cardamom Connect.
    `;
    
    return await sendEmail(farmerEmail, subject, html, text);
  } catch (error) {
    console.error('❌ [sendBulkProductRejectedEmail] Error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendProductSoldEmail,
  sendPaymentReceivedEmail,
  sendProductArrivedAtHubEmail,
  sendHubArrivalOTPEmail,
  sendBulkProductAcceptedEmail,
  sendBulkProductRejectedEmail,
  verifyEmailConfig,
  emailTemplates
};
