import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Sign In | Jobars Events",
  description: "Sign in or create an account with Jobars Events.",
}

export default function AuthPage() {
  redirect('/auth/login')
}
