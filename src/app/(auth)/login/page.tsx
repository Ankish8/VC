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
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your VectorCraft account",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
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
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
