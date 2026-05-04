import { useUser, useClerk } from "@clerk/clerk-react";
import { Check, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const plans = [
    {
        name: "Free",
        id: "free",
        price: "$0",
        period: "forever",
        description: "For casual resellers dipping their toes in.",
        features: [
            "3 product analyses / month",
            "Basic market snapshot",
            "Recent searches (last 7 days)",
            "Email support (48h response)",
        ],
        cta: "Current Plan",
        popular: false,
    },
    {
        name: "Pro",
        id: "pro",
        price: "$9",
        period: "per month",
        description: "Serious resellers who need deeper insights.",
        features: [
            "Unlimited analyses",
            "Advanced pricing bands & histogram",
            "Competition & demand metrics",
            "Deep Dive mode",
            "Priority support",
            "Early access to new features",
        ],
        cta: "Upgrade to Pro",
        popular: true,
    },
];

export default function PricingPage() {
    const { user, isLoaded: userLoaded } = useUser();
    const { openSignUp } = useClerk();   // to open Clerk’s modal manually
    const [loading, setLoading] = useState(false);
    console.log(user);
    // Check if the user is already on the Pro plan
    const isPro = user?.publicMetadata?.subscriptionStatus === "active";

    const handleSubscribe = async () => {
        // Not signed in → open sign‑up modal (they can sign up and come back)
        if (!user) {
            openSignUp();
            return;
        }

        // Signed in but already pro? No need to subscribe again
        if (isPro) return;

        // Start Stripe Checkout flow
        setLoading(true);
        try {
            const response = await fetch("/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerkUserId: user.id,
                    userEmail: user.primaryEmailAddress.emailAddress,
                }),
            });
            const { url } = await response.json();
            window.location.href = url;      // redirect to Stripe
        } catch (error) {
            console.error("Checkout error:", error);
            setLoading(false);
        }
    };

    if (!userLoaded) return null;        // wait for Clerk to load

    return (
        <div className="min-h-screen bg-background px-4 py-16">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-base font-semibold uppercase tracking-wide text-primary">
                    Pricing
                </h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Choose your plan
                </p>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Start for free. Upgrade when you’re ready to turn data into profit.
                </p>
            </div>

            <div className="mt-16 grid max-w-4xl mx-auto gap-8 md:grid-cols-2">
                {plans.map((plan) => {
                    const isCurrentPlan =
                        (plan.id === "free" && !isPro) ||
                        (plan.id === "pro" && isPro);

                    return (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col ${plan.popular
                                ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                                : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 right-6">
                                    <Badge className="bg-primary text-primary-foreground" style={{ position: "relative", top: "30px" }}>
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <h3 className="text-xl font-semibold">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline gap-x-2">
                                    <span className="text-4xl font-bold tracking-tight">
                                        {plan.price}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {plan.period}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {plan.description}
                                </p>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <ul className="space-y-3 text-sm">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? "default" : "outline"}
                                    disabled={isCurrentPlan || loading}
                                    onClick={plan.id === "pro" ? handleSubscribe : undefined}
                                >
                                    {isCurrentPlan ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Current Plan
                                        </>
                                    ) : plan.id === "pro" ? (
                                        <>
                                            {loading ? "Redirecting..." : plan.cta}
                                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                                        </>
                                    ) : (
                                        plan.cta
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Optional: enterprise / custom plan teaser */}
            <div className="mt-16 text-center text-sm text-muted-foreground">
                Need something custom?{" "}
                <a href="mailto:support@flipnova.com" className="underline underline-offset-4">
                    Contact us
                </a>
            </div>
        </div>
    );
}