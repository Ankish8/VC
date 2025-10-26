import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your VectorCraft password",
};

export default function ForgotPasswordPage() {
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
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
