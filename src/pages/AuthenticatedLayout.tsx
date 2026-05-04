// src/components/AuthenticatedLayout.tsx
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";

export default function AuthenticatedLayout() {
    return (
        <>
            <UserNavbar />
            <main className="w-full mx-auto px-4 py-6">
                <Outlet />   {/* renders the child route (Dashboard, MarketSnapshot, etc.) */}
            </main>
        </>
    );
}