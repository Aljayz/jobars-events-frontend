import { createClient } from "@/utils/supabase/server"
import { CalendarCheck, Users, Star, Building2 } from "lucide-react"

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
}

export async function Stats() {
  const supabase = await createClient()

  const [{ count: eventCount }, { count: ratingCount }, { data: avgRating }, { data: serviceCats }] = await Promise.all([
    supabase.from("events_bookings").select("*", { count: "exact", head: true }),
    supabase.from("event_ratings").select("*", { count: "exact", head: true }),
    supabase.from("event_ratings").select("rating"),
    supabase.from("services").select("category").eq("is_active", true),
  ])

  const categoryCount = serviceCats ? new Set(serviceCats.map((s) => s.category)).size : 10

  const averageRating =
    avgRating && avgRating.length > 0
      ? (avgRating.reduce((sum, r) => sum + r.rating, 0) / avgRating.length).toFixed(1)
      : "5.0"

  const stats: Stat[] = [
    {
      icon: <CalendarCheck className="size-6 sm:size-7" />,
      value: `${eventCount ?? 0}+`,
      label: "Events Managed",
    },
    {
      icon: <Star className="size-6 sm:size-7 fill-yellow-400" />,
      value: averageRating,
      label: "Average Rating",
    },
    {
      icon: <Users className="size-6 sm:size-7" />,
      value: `${ratingCount ?? 0}+`,
      label: "Client Reviews",
    },
    {
      icon: <Building2 className="size-6 sm:size-7" />,
      value: `${categoryCount}+`,
      label: "Service Categories",
    },
  ]

  return (
    <section className="relative border-y border-gray-800 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center gap-3 text-center animate-fade-in-up stagger-${(i % 4) + 1}`}
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400 sm:size-16">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</p>
                <p className="text-xs text-gray-500 sm:text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
