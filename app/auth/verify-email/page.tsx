"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase/client";
import { applyActionCode, sendEmailVerification, reload } from "firebase/auth";
import Link from "next/link";
import { Mail, CheckCircle, Loader2, ArrowRight, RefreshCw, ArrowLeft, AlertCircle, ExternalLink } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-0 sm:px-4 sm:py-8">
      <div className="hidden sm:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-4 left-2 sm:left-4 z-10">
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all">
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to login</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      <div className="w-full sm:max-w-md sm:relative px-4 sm:px-0">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-yellow-400" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  const initialError = searchParams.get("error");

  const [state, setState] = useState<"loading" | "pending" | "verified" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState(initialError ?? "");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(firebaseAuth(), oobCode)
        .then(() => setState("verified"))
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
    setRedirectError("");
    try {
      const user = firebaseAuth().currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/auth/verify-email`,
          handleCodeInApp: true,
        });
        setResendSent(true);
      } else if (email) {
        const { generateVerificationLink } = await import("@/app/auth/actions");
        const link = await generateVerificationLink(email);
        window.open(link, "_blank");
        setResendSent(true);
      }
    } catch (err) {
      setRedirectError(getReadableError(err));
    } finally {
      setResending(false);
    }
  }, [email]);

  const handleGetDirectLink = useCallback(async () => {
    setLinkLoading(true);
    setRedirectError("");
    try {
      const { generateVerificationLink } = await import("@/app/auth/actions");
      const link = await generateVerificationLink(email ?? "");
      window.location.href = link;
    } catch (err) {
      setRedirectError(getReadableError(err));
    } finally {
      setLinkLoading(false);
    }
  }, [email]);

  const handleCheckVerified = useCallback(async () => {
    setChecking(true);
    setRedirectError("");
    try {
      const user = firebaseAuth().currentUser;
      if (!user) {
        setRedirectError("No user session found. Please sign in again.");
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
        setRedirectError("Email not yet verified. Please check your inbox and try again.");
      }
    } catch (err) {
      setRedirectError(getReadableError(err));
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

  const loadingView = (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Loader2 className="size-10 animate-spin text-yellow-400" />
      <p className="text-sm text-gray-400">Verifying your email...</p>
    </div>
  );

  const errorView = (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-rose-500/10">
        <AlertCircle className="size-8 text-rose-400" />
      </div>
      <h2 className="text-xl font-bold text-white">Verification failed</h2>
      <p className="text-sm text-gray-400 max-w-sm">{errorMsg || "The verification link is invalid or has expired."}</p>
      <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95">
        Back to login
      </Link>
    </div>
  );

  const verifiedView = (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 animate-bounce-in">
        <CheckCircle className="size-8 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Email verified!</h2>
        <p className="mt-1.5 text-sm text-gray-400 max-w-sm">
          Your email has been successfully verified. You can now access your account and manage your events.
        </p>
      </div>
      <button
        onClick={handleGoToDashboard}
        disabled={redirecting}
        className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {redirecting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        Go to Dashboard
      </button>
    </div>
  );

  const pendingView = (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-yellow-400/10 animate-pulse">
        <Mail className="size-8 text-yellow-400" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="mt-1.5 text-sm text-gray-400 max-w-sm">
          We sent a verification email to
        </p>
        <p className="mt-1 text-base font-medium text-gray-200">{email || "your email address"}</p>
      </div>

      {initialError && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-950/30 border border-amber-900/50 px-4 py-3 text-sm text-amber-400 w-full max-w-xs text-left">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{initialError}</span>
        </div>
      )}

      <div className="flex flex-col gap-1 text-sm text-gray-500">
        <p>Click the link in the email to verify your account.</p>
        <p>Then click the button below to continue.</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleCheckVerified}
          disabled={checking}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 text-sm font-semibold text-black hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {checking ? "Checking..." : "I've verified, continue"}
        </button>

        <button
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-yellow-400 transition-colors disabled:opacity-50"
        >
          {resending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}
          {resending ? "Sending..." : resendSent ? "Verification email sent!" : "Resend verification email"}
        </button>
      </div>

      {email && (
        <div className="w-full max-w-xs border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500 mb-2">Not receiving the email?</p>
          <button
            onClick={handleGetDirectLink}
            disabled={linkLoading}
            className="inline-flex items-center justify-center gap-2 w-full rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {linkLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ExternalLink className="size-4" />
            )}
            {linkLoading ? "Generating..." : "Open verification link directly"}
          </button>
        </div>
      )}

      {resendSent && (
        <p className="text-xs text-emerald-400">Verification email sent. Check your inbox.</p>
      )}

      {redirectError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-950/30 border border-rose-900/50 px-4 py-3 text-sm text-rose-400 w-full max-w-xs">
          <AlertCircle className="size-4 shrink-0" />
          {redirectError}
        </div>
      )}
    </div>
  );

  const mobileContent = (
    <div className="block sm:hidden">
      {state === "loading" && loadingView}
      {state === "error" && errorView}
      {state === "verified" && verifiedView}
      {state === "pending" && pendingView}
    </div>
  );

  const desktopCard = (
    <div className="hidden sm:block rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400 to-yellow-400/0" />
      <div className="px-6 pt-5 pb-2">
        <h1 className="text-xl font-bold text-white">Email Verification</h1>
        <p className="mt-1 text-sm text-gray-500">Verify your email address to continue.</p>
      </div>
      <div className="px-6 pb-6">
        {state === "loading" && loadingView}
        {state === "error" && errorView}
        {state === "verified" && verifiedView}
        {state === "pending" && pendingView}
      </div>
    </div>
  );

  return (
    <>
      {mobileContent}
      {desktopCard}
    </>
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
