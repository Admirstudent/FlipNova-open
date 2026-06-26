// src/pages/LandingPage.tsx
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/clerk-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="landing-root">
        {/* ========== HERO ========== */}
        <section className="bg-white pt-28 pb-20">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center h-[38px] px-4 border border-gray-200 bg-gray-50 text-gray-600 text-[11px] tracking-[0.22em] uppercase font-medium mb-8">
              eBay‑First Dataset‑Powered Research Engine
            </div>

            <h1 className="text-[clamp(48px,8vw,96px)] leading-[0.94] font-[650] tracking-[-0.055em] text-gray-900 uppercase">
              3 HOURS OF RESEARCH,
              <br />
              <span className="relative inline-block text-blue-600 after:absolute after:left-0 after:bottom-[-0.15em] after:w-full after:h-[0.12em] after:bg-blue-600">
                DONE IN 5 MINUTES
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
              eBay pricing, demand, and competition — compressed into one 5‑minute snapshot.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="px-10 py-4 text-base font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Get started free
                  </button>
                </SignUpButton>
                <p className="text-sm text-gray-500">No credit card required</p>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => navigate("/app")}
                  className="px-10 py-4 text-base font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-lg"
                >
                  Go to Dashboard
                </button>
              </SignedIn>
            </div>
          </div>
        </section>

        {/* ========== VALUE PROPS ========== */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-center text-4xl font-bold text-gray-900 mb-16">
              A Fast Snapshot Built on Real Market Data
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Real-Time Price Intelligence",
                  body: "See live pricing bands, competition levels, and market saturation from active eBay listings.",
                },
                {
                  title: "5‑Minute Research Flow",
                  body: "Compresses the repetitive steps eBay sellers do across tabs into one clean output.",
                },
                {
                  title: "Seller‑First Outcomes",
                  body: "Built to help you make a decision fast: price it, list it, skip it, or source it.",
                },
              ].map((prop) => (
                <div
                  key={prop.title}
                  className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {prop.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{prop.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-center text-4xl font-bold text-gray-900 mb-16">
              What FlipNova replaces for eBay sellers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Pricing research",
                  body: "Converts raw market data into a clear price range, realistic comps, and a quick “list vs skip” signal.",
                },
                {
                  title: "Demand checks",
                  body: "Summarizes momentum and buyer activity indicators so you don’t have to bounce between tools and tabs.",
                },
                {
                  title: "Competition scans",
                  body: "Turns crowded category noise into a fast read on saturation, gaps, and where you can win.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FAQ ========== */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-center text-4xl font-bold text-gray-900 mb-16">
              Frequently Asked
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: "When is the beta?",
                  a: "Beta rolling out in waves. Join above to get priority access.",
                },
                {
                  q: "Is it free?",
                  a: "We’ll have a generous free tier. Early users get 20% off paid plans.",
                },
                {
                  q: "What makes this different?",
                  a: "FlipNova is built around datasets that compress the research workflow into a fast, structured output.",
                },
                {
                  q: "How is data handled?",
                  a: "Security‑first by design. Your data is encrypted and never sold.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="p-6 border border-gray-200 rounded-lg"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FINAL CTA ========== */}
        <section className="bg-white py-20 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Stop researching the hard way
            </h2>
            <p className="text-lg text-gray-500 mb-10">Founding cohort forming now</p>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-12 py-4 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                  Get Started Now
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => navigate("/app")}
                className="px-12 py-4 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-xl shadow-blue-200"
              >
                Open Dashboard
              </button>
            </SignedIn>
          </div>
        </section>
      </div>
    </>
  );
}