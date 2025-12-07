const express = require('express');
const router = express.Router();

const { capturePayment, verifyPayment, stripeWebhookHandler, stripeHealth, completeCheckoutSession, getPurchaseHistory } = require('../controllers/payments');
const bodyParser = require('body-parser');
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth');

router.post('/capturePayment', auth, isStudent, capturePayment);
// For simplicity, verify via POST after success redirect (non-webhook)
router.post('/verifyPayment', auth, isStudent, verifyPayment);

// Note: For Stripe webhooks you'd expose a raw-body endpoint like below
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Stripe connectivity diagnostic route
router.get('/stripe/health', stripeHealth);

// Fallback finalize enrollment by session_id after success redirect
router.get('/stripe/complete', completeCheckoutSession);

// Purchase history route
router.get('/purchase-history', auth, isStudent, getPurchaseHistory);

module.exports = router
