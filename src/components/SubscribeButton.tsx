// SubscribeButton.tsx
import { useUser } from "@clerk/clerk-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function SubscribeButton() {
  const { user } = useUser();

  const handleSubscribe = async () => {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkUserId: user.id,
        userEmail: user.primaryEmailAddress,
      }),
    });
    const { url } = await response.json();
    window.location.href = url;                 // redirect to Stripe
  };

  return (
    <button onClick={handleSubscribe}>
      Subscribe – $9/month
    </button>
  );
}