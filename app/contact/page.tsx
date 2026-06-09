import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHero } from "@/components/reusable/page-hero"
import { submitContact } from "./actions"
import FlashBanner from "@/components/ui/flash-banner"
import { MapPin, Phone, Mail, Clock, Send, User, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact Us | Jobars Events",
  description: "Get in touch with Jobars Events for inquiries about our event services in Bayugan City, Agusan del Sur.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-950 pt-24">
      <PageHero
        badge="Get in Touch"
        title={
          <>
            Let&apos;s Talk About <span className="italic text-yellow-400">Your Event</span>
          </>
        }
        description="Have a question, need a quote, or ready to start planning? Fill out the form below and we'll get back to you within 24 hours."
      />

      <Suspense fallback={null}><FlashBanner /></Suspense>

      {/* Contact Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Info Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 animate-fade-in-up">
                <h2 className="mb-4 text-lg font-bold text-white">Contact Information</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Address</p>
                      <p className="text-sm text-gray-400">Bayugan City, Agusan del Sur, Philippines</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-5 shrink-0 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Phone</p>
                      <p className="text-sm text-gray-400">+63 968 666 6783</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-5 shrink-0 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Email</p>
                      <p className="text-sm text-gray-400">jobars.info@gmail.com</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Business Hours</p>
                      <p className="text-sm text-gray-400">Monday to Saturday, 8:00 AM to 6:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 animate-fade-in-up stagger-2">
                <h2 className="mb-3 text-lg font-bold text-white">Follow Us</h2>
                <a
                  href="https://www.facebook.com/profile.php?id=100063642080742"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook Page
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 animate-fade-in-up stagger-3">
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-md sm:p-10">
                <form action={submitContact} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300 text-sm font-medium">Your Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          id="name"
                          name="name"
                          required
                          placeholder="John Doe"
                          className="bg-gray-900/60 border-gray-700 text-white focus:border-yellow-400 h-11 sm:h-12 pl-10 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Your Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="john@example.com"
                          className="bg-gray-900/60 border-gray-700 text-white focus:border-yellow-400 h-11 sm:h-12 pl-10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300 text-sm font-medium">Subject</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="subject"
                        name="subject"
                        required
                        placeholder="Event Inquiry"
                        className="bg-gray-900/60 border-gray-700 text-white focus:border-yellow-400 h-11 sm:h-12 pl-10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300 text-sm font-medium">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      aria-label="Message"
                      className="w-full resize-none rounded-xl border border-gray-700 bg-gray-900/60 p-4 text-sm text-white transition-all placeholder:text-gray-600 focus:border-yellow-400 focus:outline-none"
                      placeholder="Tell us about your event, date, type, number of guests, and any specific requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 sm:h-14 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-400/10"
                  >
                    Send Message
                    <Send className="size-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
