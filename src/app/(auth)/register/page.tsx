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
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new VectorCraft account",
};

export default function RegisterPage() {
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
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account and start converting images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
