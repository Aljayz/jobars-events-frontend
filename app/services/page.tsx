import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { PageHero } from "@/components/reusable/page-hero"
import { ServicesGrid } from "@/components/section/services-grid"

export const metadata: Metadata = {
  title: "Services | Jobars Events",
  description: "Explore our comprehensive range of event services including weddings, corporate events, catering, sound system, photo & video, and more in Bayugan City.",
}

function ServicesSkeleton() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-900" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gray-950 pt-24">
      <PageHero
        badge="What We Do"
        title={
          <>
            Our <span className="italic text-yellow-400 underline decoration-yellow-400 underline-offset-8">Services</span>
          </>
        }
        description="We provide a comprehensive range of event services designed to make your celebration seamless, memorable, and stress-free. From intimate gatherings to grand productions, we've got you covered."
      />

      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesGrid />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Get <span className="text-yellow-400 italic">Started?</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Tell us about your event and we&apos;ll create a customized package that fits your needs and budget.
          </p>
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
