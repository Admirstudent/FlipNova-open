// components/ProGate.tsx
import { useUser } from "@clerk/clerk-react";
import { Outlet, Navigate } from "react-router-dom";

export default function ProGate() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;
  const isPro = user?.publicMetadata?.subscriptionStatus === 'active';

  if (!isPro) return <Navigate to="/pricing" replace />;
  return <Outlet />;
}