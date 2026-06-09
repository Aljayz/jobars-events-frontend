import type { Metadata } from "next"
import SignUp from "@/components/auth/signup"

export const metadata: Metadata = {
  title: "Sign Up | Jobars Events",
  description: "Create an account with Jobars Events to get started.",
}

export default function SignUpPage() {
  return <SignUp />
}
