import type { Metadata } from "next"
import Login from "@/components/auth/login"

export const metadata: Metadata = {
  title: "Login | Jobars Events",
  description: "Sign in to your Jobars Events account.",
}

export default function LoginPage() {
  return <Login />
}
