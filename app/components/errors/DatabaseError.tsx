"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DatabaseErrorProps {
  error: Error;
  onRetry?: () => void;
}

export default function DatabaseError({ error, onRetry }: DatabaseErrorProps) {
  return (
    <div className="container mx-auto p-6 max-w-md">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>
          {error.message || "Failed to connect to the database. Please try again."}
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col items-center gap-4 mt-6">
        <p className="text-muted-foreground text-center">
          This could be due to browser storage issues or permission restrictions.
        </p>
        
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry Connection</span>
          </Button>
        )}
      </div>
    </div>
  );
} 