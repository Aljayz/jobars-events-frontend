"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase/client";
import { applyActionCode, sendEmailVerification, reload } from "firebase/auth";
import Link from "next/link";
import { Mail, CheckCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="size-8 animate-spin text-yellow-400" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [state, setState] = useState<"loading" | "pending" | "verified" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(firebaseAuth(), oobCode)
        .then(() => {
          setState("verified");
        })
        .catch((err) => {
          setState("error");
          setErrorMsg(getReadableError(err));
        });
    } else {
      setState("pending");
    }
  }, [mode, oobCode]);

  const handleResend = useCallback(async () => {
    setResending(true);
    setResendSent(false);
    try {
      const user = firebaseAuth().currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/auth/verify-email`,
          handleCodeInApp: true,
        });
        setResendSent(true);
      }
    } catch (err) {
      setErrorMsg(getReadableError(err));
    } finally {
      setResending(false);
    }
  }, []);

  const handleCheckVerified = useCallback(async () => {
    setChecking(true);
    try {
      const user = firebaseAuth().currentUser;
      if (!user) {
        setErrorMsg("No user session found. Please sign in again.");
        return;
      }
      await reload(user);
      if (user.emailVerified) {
        setRedirecting(true);
        const idToken = await user.getIdToken(true);
        const { createAuthSession } = await import("@/app/auth/actions");
        await createAuthSession(idToken);
        window.location.href = "/dashboard";
      } else {
        setErrorMsg("Email not yet verified. Please check your inbox and try again.");
      }
    } catch (err) {
      setErrorMsg(getReadableError(err));
    } finally {
      setChecking(false);
    }
  }, []);

  const handleGoToDashboard = useCallback(async () => {
    setRedirecting(true);
    try {
      const user = firebaseAuth().currentUser;
      if (user) {
        const idToken = await user.getIdToken(true);
        const { createAuthSession } = await import("@/app/auth/actions");
        await createAuthSession(idToken);
      }
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/auth/login";
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Jobars Events</h1>
          <p className="mt-1 text-sm text-gray-500">Email Verification</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
          {state === "loading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="size-8 animate-spin text-yellow-400" />
              <p className="text-sm text-gray-400">Verifying your email...</p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-rose-500/10">
                <Mail className="size-7 text-rose-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Verification failed</h2>
              <p className="text-sm text-gray-400">{errorMsg || "The verification link is invalid or expired."}</p>
              <Link href="/auth/login" className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
                Back to login
              </Link>
            </div>
          )}

          {state === "verified" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="size-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Email verified!</h2>
              <p className="text-sm text-gray-400">
                Your email has been successfully verified. You can now access your account.
              </p>
              <button
                onClick={handleGoToDashboard}
                disabled={redirecting}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {redirecting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                Go to Dashboard
              </button>
            </div>
          )}

          {state === "pending" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-yellow-400/10">
                <Mail className="size-7 text-yellow-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Check your email</h2>
              <p className="text-sm text-gray-400">
                We sent a verification email to
              </p>
              <p className="text-sm font-medium text-gray-200">{email || "your email address"}</p>
              <p className="text-xs text-gray-500">
                Click the link in the email to verify your account, then come back here.
              </p>

              <div className="mt-4 flex flex-col gap-3 w-full">
                <button
                  onClick={handleCheckVerified}
                  disabled={checking}
                  className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {checking ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  {checking ? "Checking..." : "I've verified, continue"}
                </button>

                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm font-medium text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                >
                  {resending ? "Sending..." : resendSent ? "Email sent!" : "Resend verification email"}
                </button>
              </div>

              {errorMsg && (
                <p className="text-sm text-rose-400">{errorMsg}</p>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

function getReadableError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    switch (code) {
      case "auth/expired-action-code":
        return "The verification link has expired. Request a new one.";
      case "auth/invalid-action-code":
        return "The verification link is invalid. Request a new one.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "User not found.";
      default:
        return err.message;
    }
  }
  return "An unexpected error occurred";
}
