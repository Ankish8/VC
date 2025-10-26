"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Mail, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function PaymentSuccessBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    title: string;
    description: string;
    email?: string;
  } | null>(null);

  // Email change functionality
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState("");
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const email = searchParams.get("email");
    const newUser = searchParams.get("newUser");
    const existing = searchParams.get("existing");
    const messageParam = searchParams.get("message");
    const txn = searchParams.get("txn");

    // Store transaction ID for email change feature
    if (txn) {
      setTransactionId(decodeURIComponent(txn));
    }

    if (payment === "success") {
      setShow(true);

      if (newUser === "true" && email) {
        setMessage({
          type: "success",
          title: "Payment Successful!",
          description: `Thank you for your purchase! We've sent your login credentials to ${decodeURIComponent(email)}. Please check your inbox and spam/junk folder. If you don't receive it within 5 minutes, contact support.`,
          email: decodeURIComponent(email),
        });
      } else if (existing === "true") {
        setMessage({
          type: "success",
          title: "Subscription Updated!",
          description: "Your lifetime subscription has been activated. You can now login and enjoy unlimited conversions!",
        });
      } else {
        setMessage({
          type: "success",
          title: "Payment Successful!",
          description: "Thank you for your purchase! Please check your email for login credentials.",
        });
      }
    } else if (payment === "cancelled") {
      setShow(true);
      setMessage({
        type: "error",
        title: "Payment Cancelled",
        description: "Your payment was cancelled. No charges were made. Feel free to try again when you're ready!",
      });
    } else if (payment === "failed" || payment === "error") {
      setShow(true);
      const errorMsg = messageParam ? decodeURIComponent(messageParam) : "Unknown error";
      setMessage({
        type: "error",
        title: "Payment Failed",
        description: `There was an issue processing your payment: ${errorMsg}. Please try again or contact support.`,
      });
    }
  }, [searchParams]);

  const handleChangeEmail = async () => {
    if (!newEmail || !transactionId) return;

    setEmailChangeError("");
    setEmailChangeLoading(true);

    try {
      const response = await fetch("/api/auth/change-email-after-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newEmail,
          transactionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change email");
      }

      // Update the displayed email
      setMessage((prev) => prev ? { ...prev, email: newEmail } : null);
      setEmailChangeSuccess(true);
      setIsChangingEmail(false);
      setNewEmail("");

      // Hide success message after 5 seconds
      setTimeout(() => {
        setEmailChangeSuccess(false);
      }, 5000);
    } catch (error: any) {
      setEmailChangeError(error.message || "An error occurred");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  if (!show || !message) return null;

  return (
    <div className="fixed top-32 left-0 right-0 z-50 px-4 py-4 animate-in slide-in-from-top duration-500">
      <div className="container mx-auto max-w-4xl">
        <div
          className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl ${
            message.type === "success"
              ? "bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-emerald-500/20"
              : "bg-gradient-to-r from-red-500/10 via-orange-500/10 to-pink-500/10 border-red-500/20"
          }`}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

          <div className="relative px-6 py-5">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 rounded-full p-2 ${
                message.type === "success"
                  ? "bg-gradient-to-br from-emerald-400 to-cyan-500"
                  : "bg-gradient-to-br from-red-400 to-pink-500"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                ) : (
                  <XCircle className="h-6 w-6 text-white" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {message.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {message.description}
                </p>

                {message.email && (
                  <div className="flex flex-col gap-3 pt-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        asChild
                        className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        <Link href="/login">
                          Go to Login
                        </Link>
                      </Button>

                      {transactionId && !isChangingEmail && (
                        <Button
                          onClick={() => setIsChangingEmail(true)}
                          variant="outline"
                          className="w-fit border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend to Different Email
                        </Button>
                      )}
                    </div>

                    {emailChangeSuccess && (
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Credentials successfully sent to new email!
                      </div>
                    )}

                    {isChangingEmail && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          Enter your correct email address:
                        </p>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="your-email@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            disabled={emailChangeLoading}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleChangeEmail}
                            disabled={!newEmail || emailChangeLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {emailChangeLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send"
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setIsChangingEmail(false);
                              setNewEmail("");
                              setEmailChangeError("");
                            }}
                            variant="outline"
                            disabled={emailChangeLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                        {emailChangeError && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {emailChangeError}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email sent to: <span className="font-semibold">{message.email}</span>
                    </p>
                  </div>
                )}

                {message.type === "success" && !message.email && (
                  <Button
                    asChild
                    className="mt-3 w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Link href="/login">
                      Go to Login
                    </Link>
                  </Button>
                )}
              </div>

              <button
                onClick={() => setShow(false)}
                className="flex-shrink-0 rounded-full p-1 hover:bg-gray-200/50 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
