import type { Metadata } from "next"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Mail, Target, Eye, Heart, Users } from "lucide-react"
import { PageHero } from "@/components/reusable/page-hero"
import { TeamGrid } from "@/components/section/team-grid"
import { getCachedBusinessSettings } from "@/lib/business"

export const metadata: Metadata = {
  title: "About Us | Jobars Events",
  description: "Learn about Jobars Events — your premier event services provider in Bayugan City, Agusan del Sur. Discover our story, mission, and commitment to excellence.",
}

const values = [
  {
    icon: <Heart className="size-5" />,
    title: "Passion for Excellence",
    description: "We pour our hearts into every event, treating each celebration as if it were our own. No detail is too small.",
  },
  {
    icon: <Eye className="size-5" />,
    title: "Attention to Detail",
    description: "From the color of the tablecloths to the timing of each toast, we obsess over the details that make events extraordinary.",
  },
  {
    icon: <Target className="size-5" />,
    title: "Reliability & Integrity",
    description: "We show up on time, deliver on our promises, and communicate honestly with our clients every step of the way.",
  },
]

export default async function AboutPage() {
  const settings = await getCachedBusinessSettings()
  return (
    <main className="min-h-screen bg-gray-950 pt-24">
      <PageHero
        badge="About Us"
        title={
          <>
            Your Vision, <span className="italic text-yellow-400">Our Mission</span>
          </>
        }
        description="Creating unforgettable experiences in Bayugan City and beyond through passion, precision, and genuine care."
      />

      {/* Story Section */}
      <section className="border-b border-gray-800 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <p className="text-lg leading-relaxed text-gray-400">
                Jobars Events is a full-service event management company based in Bayugan City, Agusan del Sur.
                We specialize in creating unforgettable experiences: from elegant weddings and milestone
                celebrations to professional corporate events.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-400">
                Founded with a passion for bringing people together, we combine creativity, meticulous planning,
                and genuine care to deliver events that exceed expectations. Our team of experienced coordinators,
                designers, and production specialists work tirelessly to turn your vision into reality.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl animate-fade-in-up stagger-2">
              <Image
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
                alt="Jobars Events celebration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-b border-gray-800/50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 animate-fade-in-up">
              <h2 className="mb-4 text-2xl font-bold text-yellow-400">Our Mission</h2>
              <p className="leading-relaxed text-gray-400">
                To provide exceptional event planning and production services that transform our clients&apos;
                dreams into memorable realities. We strive to make every event seamless, stress-free, and
                extraordinary by combining creative vision with flawless execution.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 animate-fade-in-up stagger-2">
              <h2 className="mb-4 text-2xl font-bold text-yellow-400">Our Vision</h2>
              <p className="leading-relaxed text-gray-400">
                To be the most trusted and sought-after event services provider in the Caraga region,
                known for our unwavering commitment to quality, creativity, and client satisfaction.
                We envision a community where every celebration is a masterpiece.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-gray-800/50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              What We <span className="italic text-yellow-400">Stand For</span>
            </h2>
            <p className="mt-3 text-gray-400">The principles that guide everything we do</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`rounded-xl border border-gray-800 bg-gray-900/30 p-6 transition-all hover:border-yellow-400/30 animate-fade-in-up stagger-${(i % 3) + 1}`}
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  {v.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{v.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-b border-gray-800/50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center animate-fade-in-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-4 py-1.5 text-sm font-medium text-yellow-400">
              <Users className="size-4" />
              Our Team
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Meet the <span className="italic text-yellow-400">People</span> Behind the Magic
            </h2>
            <p className="mt-3 text-gray-400">The dedicated team making every event extraordinary</p>
          </div>
          <Suspense
            fallback={
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-900" />
                ))}
              </div>
            }
          >
            <TeamGrid />
          </Suspense>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Let&apos;s Create Something <span className="italic text-yellow-400">Beautiful</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Have an event coming up? We&apos;d love to hear about it. Reach out and let&apos;s start planning.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2"><MapPin className="size-4 text-yellow-400" /> {settings.address}</span>
            <span className="flex items-center gap-2"><Phone className="size-4 text-yellow-400" /> {settings.phone}</span>
            <span className="flex items-center gap-2"><Mail className="size-4 text-yellow-400" /> {settings.email}</span>
          </div>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-yellow-400 px-8 text-lg font-bold text-black transition-all hover:scale-105 hover:bg-yellow-500 active:scale-95"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  )
}
