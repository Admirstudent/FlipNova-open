// src/components/Footer.tsx
export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white py-8 mt-20">
            <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} FlipNova. Built for eBay resellers.</p>
                <p className="mt-1">
                    <a href="/docs" className="underline hover:text-gray-700">Documentation</a>
                    &nbsp;·&nbsp;
                    <a href="/privacy" className="underline hover:text-gray-700">Privacy</a>
                </p>
            </div>
        </footer>
    );
}