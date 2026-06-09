'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, CalendarPlus, X, Menu, LayoutDashboard } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { firebaseAuth } from '@/lib/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'
import { Button } from '../ui/button'
import { useScroll } from '@/lib/hooks/use-scroll'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const scrolled = useScroll(100)
  const { push } = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth(), (user) => setIsLoggedIn(!!user))
    return unsub
  }, [])

  if (pathname === '/auth/login' || pathname === '/auth/sign-up') {
    return null
  }

  const isHome = pathname === '/'
  const isTransparent = !scrolled && isHome

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-20 transition-all duration-500',
        isTransparent
          ? 'bg-transparent'
          : 'bg-gray-950/80 shadow-lg backdrop-blur-lg'
      )}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <button
          type="button"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="size-6 text-white" /> : <Menu className="size-6 text-white" />}
        </button>

        <Link href="/" className="flex items-center gap-x-3">
          <div className={cn(
            'transition-all duration-500',
            !scrolled && isHome
              ? 'opacity-0 invisible translate-y-[-8px]'
              : 'opacity-100 visible translate-y-0'
          )}>
            <Image
              src="/images/jobars-events-logo.png"
              alt="Jobars Events"
              width={140}
              height={80}
              className="transition-all duration-500"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </Link>

        <nav
          className={cn(
            'hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-x-8',
            isTransparent ? 'text-white' : 'text-white'
          )}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative py-1 text-sm font-medium transition-colors',
                'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-yellow-400 after:transition-all after:duration-300',
                'hover:after:w-full',
                pathname === href
                  ? 'text-yellow-400 after:w-full'
                  : 'hover:text-yellow-400'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => push('/book')}
            className={cn(
              'transition-colors',
              isTransparent
                ? 'text-white hover:text-yellow-400 hover:bg-white/10'
                : 'text-white hover:text-yellow-400 hover:bg-gray-800'
            )}
          >
            <CalendarPlus className="size-4" />
            <span className="hidden lg:inline ml-1">Book Now</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => push(isLoggedIn ? '/dashboard' : '/auth')}
            className="border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400 hover:text-white transition-all duration-300"
          >
            {isLoggedIn ? <LayoutDashboard className="size-4" /> : <User className="size-4" />}
            <span className="hidden lg:inline ml-1">{isLoggedIn ? 'Dashboard' : 'Login'}</span>
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950">
          <nav className="flex flex-col gap-y-1 p-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                {label}
              </Link>
            ))}
            <hr className="my-3 border-gray-800" />
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => {
                push('/book')
                setIsMenuOpen(false)
              }}
            >
              <CalendarPlus className="size-4 mr-2" />
              Book Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white bg-transparent"
              onClick={() => {
                push(isLoggedIn ? '/dashboard' : '/auth')
                setIsMenuOpen(false)
              }}
            >
              {isLoggedIn ? <LayoutDashboard className="size-4 mr-2" /> : <User className="size-4 mr-2" />}
              {isLoggedIn ? 'Dashboard' : 'Login'}
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
