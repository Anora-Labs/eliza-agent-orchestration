"use client";

import { useDatabase } from "../contexts/DatabaseContext";
import DefaultLoading from "./default-loading";
import DatabaseError from "./errors/DatabaseError";

export function DBLoader({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useDatabase();

  if (isLoading) {
    return (
        <DefaultLoading text="loading database..." />
    );
  }

  if (error) {
    return <DatabaseError error={error} onRetry={() => window.location.reload()} />;
  }

  return <>{children}</>;
} 