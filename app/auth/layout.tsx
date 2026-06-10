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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-0 sm:px-4 sm:py-8">
      <div className="hidden sm:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-4 left-2 sm:left-4 z-10">
        <Link href="/">
          <Button variant="ghost" className="text-gray-500 hover:text-white hover:bg-gray-800/50 flex items-center gap-2 px-2 sm:px-3">
            <ArrowLeft className="size-4" />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
      </div>

      <div className="w-full sm:max-w-md sm:relative">
        <div className="px-4 sm:px-0 pt-12 sm:pt-0 pb-4 sm:pb-0">
          <Tabs value={activeTab} className="flex justify-center">
            <TabsList className="grid grid-cols-2 w-auto min-w-[260px] bg-gray-900/80 border border-gray-800 sm:backdrop-blur-sm p-1 rounded-xl">
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
        </div>
        <div key={pathname} className="sm:mt-5 animate-fade-in-up">{children}</div>
      </div>
    </div>
  )
}
