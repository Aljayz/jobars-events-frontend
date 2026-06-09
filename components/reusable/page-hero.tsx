import type { ReactNode } from "react"

interface PageHeroProps {
  badge: string
  title: ReactNode
  description: string
}

export function PageHero({ badge, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-gray-800">
      <div className="absolute -left-20 top-1/4 size-72 bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-1/4 top-0 size-96 bg-yellow-400/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
        <div className="text-center animate-fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-4 py-1.5 text-sm font-medium text-yellow-400">
            {badge}
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
