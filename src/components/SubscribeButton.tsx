// SubscribeButton.tsx
import { useUser } from "@clerk/clerk-react";

export default function SubscribeButton() {
  const { user } = useUser();

  const handleSubscribe = async () => {
    if(!user) { return; }
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