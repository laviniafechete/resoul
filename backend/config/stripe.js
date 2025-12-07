const Stripe = require("stripe");

let stripeInstance;

exports.getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY in environment");
    }

    const options = { apiVersion: "2025-05-28.basil" };

    // If STRIPE_API_HOST is set (e.g., api.sandbox.stripe.com),
    // use it instead of the default api.stripe.com
    if (process.env.STRIPE_API_HOST) {
      options.host = process.env.STRIPE_API_HOST; // "api.sandbox.stripe.com"
      options.port = 443;
      options.protocol = "https";
    }

    stripeInstance = Stripe(process.env.STRIPE_SECRET_KEY, options);
  }
  return stripeInstance;
};