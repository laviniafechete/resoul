exports.paymentSuccessEmail = (firstName, amount, orderId, paymentId) => {
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2E86DE;">Payment Confirmation</h2>
      <p>Hi ${firstName || 'Student'},</p>
      <p>We’ve successfully received your payment of <strong>$${amount.toFixed(2)}</strong>.</p>
  
      <h3 style="margin-top: 20px;">Payment Details:</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Order ID:</strong> ${orderId}</li>
        <li><strong>Payment ID:</strong> ${paymentId}</li>
      </ul>
  
      <p>Thank you for enrolling in our courses! You can now access your purchased content from your dashboard.</p>
      <p>Happy learning! 🎓</p>
  
      <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
        — The Learnhub Team
      </p>
    </div>
    `;
  };