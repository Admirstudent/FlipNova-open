// src/components/ProtectedRoute.tsx
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null; // or a loading spinner
  if (!isSignedIn) return <Navigate to="/landing" replace />;

  return <Outlet />;
}