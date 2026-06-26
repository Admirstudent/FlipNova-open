// src/App.tsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";               // public navbar
import Footer from "./components/Footer";
import AuthenticatedLayout from "./pages/AuthenticatedLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// pages
import LandingPage from "./pages/LandingPage";
import UserDashboard from "./pages/UserDashboard";
import MarketSnapshotPage from "./pages/MarketSnapshotPage";
import PricingPage from "./pages/PricingPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes – uses the simple Navbar */}
        <Route
          element={
            <>
              <Navbar />
              <main className="w-full mx-auto px-4 py-6">
                <Outlet />
              </main>
              <Footer />
            </>
          }
        >
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          {/* /docs placeholder removed — mock portfolio */}
          <Route path="/pricing" element={<PricingPage />} />
        </Route>

        {/* Protected routes – uses UserNavbar + authentication check */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/app" element={<MarketSnapshotPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;