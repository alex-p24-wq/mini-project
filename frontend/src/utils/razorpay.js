// Razorpay utility functions

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initializeRazorpayPayment = (options) => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    const rzp = new window.Razorpay({
      key: options.key,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name || 'E-Cardamom Connect',
      description: options.description || 'Payment for your order',
      image: options.image || '/logo.png',
      order_id: options.order_id,
      handler: function (response) {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: options.notes || {},
      theme: {
        color: options.theme?.color || '#2e7d32',
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled by user'));
        },
      },
    });

    rzp.on('payment.failed', function (response) {
      reject({
        error: response.error,
        reason: response.error.reason,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
      });
    });

    rzp.open();
  });
};

// Format amount for display
export const formatAmount = (amount, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    return `₹${amount}`;
  }
};

// Validate payment data
export const validatePaymentData = (paymentData) => {
  const required = ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature'];
  
  for (const field of required) {
    if (!paymentData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return true;
};
