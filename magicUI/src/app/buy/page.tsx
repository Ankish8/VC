"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuyPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main VectorCraft application buy page
    window.location.href = "http://localhost:8080/buy";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to checkout...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you to the secure checkout page.</p>
      </div>
    </div>
  );
}