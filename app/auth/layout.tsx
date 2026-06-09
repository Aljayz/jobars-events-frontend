"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeTab = pathname === '/auth/sign-up' ? 'signup' : 'login'

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="ghost" className="text-gray-500 hover:text-white hover:bg-gray-800/50 flex items-center gap-2 px-3">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md relative">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/80 border border-gray-800 backdrop-blur-sm p-1 rounded-xl">
            <Link href="/auth/login" className="w-full">
              <TabsTrigger value="login" className="w-full rounded-lg data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-400/20 text-gray-300 data-[state=inactive]:hover:text-white transition-all">
                Login
              </TabsTrigger>
            </Link>
            <Link href="/auth/sign-up" className="w-full">
              <TabsTrigger value="signup" className="w-full rounded-lg data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-400/20 text-gray-300 data-[state=inactive]:hover:text-white transition-all">
                Sign Up
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
