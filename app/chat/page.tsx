"use client";

import { useDatabase } from "@/app/contexts/DatabaseContext";
import DatabaseError from "@/app/components/errors/DatabaseError";
import ChatInterface from "@/app/components/chat/ChatInterface";
import DefaultLoading from "../components/default-loading";

export default function ChatPage() {
  const { error, isLoading } = useDatabase();

  if (error) {
    return <DatabaseError error={error} onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return (
      <DefaultLoading text="loading..." />
    );
  }

  return (
    <>
      <div className="@container/main relative flex h-full w-full flex-col items-center justify-end">
        <ChatInterface />
      </div>
    </>
  );
} 