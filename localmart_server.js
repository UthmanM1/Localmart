// backend/server.js
// Express.js payment server for LocalMart
// Handles Stripe Payment Intent creation server-side (keeps secret key off the device)

const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

/**
 * POST /create-payment-intent
 * Body: { amount: number (pence), currency: string, listingId: string }
 * Returns: { clientSecret: string }
 */
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'gbp', listingId, buyerId } = req.body;

  if (!amount || amount < 30) {
    return res.status(400).json({ error: 'Invalid amount — minimum 30p' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in pence
      currency,
      metadata: { listingId, buyerId },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /webhook
 * Stripe webhook — fires on payment_intent.succeeded
 * Updates Firestore order status server-side
 */
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const { listingId, buyerId } = event.data.object.metadata;
    console.log(`Payment succeeded — listing ${listingId} bought by ${buyerId}`);
    // Firestore update would be called here via firebase-admin
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`LocalMart payment server running on port ${PORT}`));
