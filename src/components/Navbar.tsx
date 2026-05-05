// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo / Home link */}
                <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
                    FlipNova
                </Link>

                {/* Right side – auth buttons */} 
                <div className="flex items-center gap-3">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                                Sign in
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-sm">
                                Get started
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            to="/app"
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                        >
                            Dashboard
                        </Link>
                        <UserButton afterSignOutUrl="/" ></UserButton>
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}