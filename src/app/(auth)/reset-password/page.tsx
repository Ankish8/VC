"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="flex justify-center">
          <Image
            src="/logo-black.svg"
            alt="VectorCraft"
            width={180}
            height={40}
            className="dark:hidden"
            priority
          />
          <Image
            src="/logo-white.svg"
            alt="VectorCraft"
            width={180}
            height={40}
            className="hidden dark:block"
            priority
          />
        </Link>
        <p className="text-sm text-muted-foreground">
          AI-Powered SVG Converter
        </p>
      </div>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Reset Your Password
          </CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid or missing reset token. Please request a new password
                reset link.
                <br />
                <Link
                  href="/forgot-password"
                  className="font-medium underline underline-offset-4 mt-2 inline-block"
                >
                  Request New Link
                </Link>
              </AlertDescription>
            </Alert>
          ) : (
            <ResetPasswordForm token={token} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
