"use client";

import React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeClosed } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { createAuthSession, clearAuthSession } from "@/app/auth/actions";

function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/user-disabled":
        return "This account has been disabled";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later";
      default:
        return error.message;
    }
  }
  return "An unexpected error occurred";
}

function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [googlePending, setGooglePending] = React.useState(false);

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth(), email, password);
        const idToken = await userCredential.user.getIdToken();
        await createAuthSession(idToken);
        window.location.href = "/dashboard";
        return undefined;
      } catch (error) {
        return { error: getFirebaseErrorMessage(error) };
      }
    },
    undefined,
  );

  const handleGoogleSignIn = async () => {
    setGooglePending(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth(), provider);
      const idToken = await result.user.getIdToken();
      await createAuthSession(idToken);
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      if ((error as { code?: string })?.code !== "auth/popup-closed-by-user") {
        console.error("Google sign-in failed:", error);
      }
    } finally {
      setGooglePending(false);
    }
  };

  const form = (
    <>
      <div className="h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400 to-yellow-400/0 sm:block hidden" />
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
        <CardTitle className="text-xl font-bold text-white">Welcome Back</CardTitle>
        <CardDescription className="text-gray-500 text-sm">
          Sign in to your account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form action={action} id="login-form">
          <div className="flex flex-col gap-4 sm:gap-5">
            {state?.error && (
              <div className="rounded-xl bg-red-950/50 border border-red-900/50 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                {state.error}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
              <div className="relative group">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  required
                  className="pl-4 pr-4 bg-gray-800/90 border-gray-700 text-white placeholder-gray-600 focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 h-12 rounded-xl transition-all"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                <button type="button" className="text-xs font-medium text-yellow-400/70 hover:text-yellow-400 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-4 pr-10 bg-gray-800/90 border-gray-700 text-white placeholder-gray-600 focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 h-12 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <Button
              type="submit"
              disabled={pending}
              className="w-full h-12 rounded-xl text-black font-semibold bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-400 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <div className="relative mx-4 sm:mx-6 my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900/60 px-3 text-gray-600">Or continue with</span>
        </div>
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <Button
          type="button"
          variant="outline"
          disabled={googlePending}
          onClick={handleGoogleSignIn}
          className="w-full h-12 rounded-xl bg-transparent border-gray-700/60 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
        >
          {googlePending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-gray-500 border-t-white animate-spin" />
              Signing in...
            </span>
          ) : (
            <>
              <Image src="/images/google-favicon.svg" alt="" width={18} height={18} className="mr-2" />
              Google
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: flat layout */}
      <div className="block sm:hidden bg-gray-900/30">
        {form}
      </div>

      {/* Desktop: card layout */}
      <Card className="hidden sm:block w-full border-gray-800/60 bg-gray-900/60 backdrop-blur-xl shadow-2xl shadow-black/30 rounded-2xl overflow-hidden">
        {form}
      </Card>
    </>
  );
}

export default Login;
