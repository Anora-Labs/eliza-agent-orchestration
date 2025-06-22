"use client";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import BottomNavigation from "../components/dashboard/BottomNavigation";
import DatabaseError from "../components/errors/DatabaseError";
import { useDatabase } from "../contexts/DatabaseContext";
import DefaultLoading from "../components/default-loading";
import { useUser } from "@/providers/user-provider";
import { useEffect, useState } from "react";
import AuthWidget from "../components/auth/auth-popover";

export default function HomePage() {
  const { error, isLoading } = useDatabase();
  // Auth state
  const { user } = useUser();
  const [isAuthWidgetOpen, setIsAuthWidgetOpen] = useState(false);

  if (error) {
    return <DatabaseError error={error} onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return (
      <DefaultLoading text="loading..." />
    );
  }

  useEffect(() => {
    console.log("User state changed:", user);
    if (!user) {
      console.log("No user found, opening auth widget");
      setIsAuthWidgetOpen(true);
    } else {
      console.log("User found, closing auth widget");
      setIsAuthWidgetOpen(false);
    }
  }, [user]);

  return (
    <>
      {/* Dashboard */}
      <div className="container mx-auto p-2 space-y-6 pb-20 md:pb-6">
        <DashboardHeader />
        <DashboardStats />
      </div>
      <BottomNavigation />

      {/* Auth widget */}
      <AuthWidget isOpen={isAuthWidgetOpen} setIsOpen={setIsAuthWidgetOpen} user={user} />
    </>
  );
} 