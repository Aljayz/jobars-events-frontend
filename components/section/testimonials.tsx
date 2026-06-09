import { createClient } from "@/utils/supabase/server"
import { Star, Quote } from "lucide-react"

export async function Testimonials() {
  const supabase = await createClient()
  const { data: ratings } = await supabase
    .from("event_ratings")
    .select("rating, review, created_at, profiles:client_id(full_name, avatar_url)")
    .not("review", "is", null)
    .order("created_at", { ascending: false })
    .limit(6)

  if (!ratings || ratings.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-4 py-1.5 text-sm font-medium text-yellow-400">
            <Star className="size-4 fill-yellow-400" />
            Testimonials
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            What Our <span className="italic text-yellow-400">Clients Say</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Real feedback from the events we&apos;ve had the pleasure of organizing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ratings.map((r, i) => {
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
            return (
              <div
                key={r.created_at}
                className={`rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5 animate-fade-in-up stagger-${(i % 6) + 1}`}
              >
                <Quote className="mb-3 size-6 text-yellow-400/40" />
                <p className="mb-4 text-sm leading-relaxed text-gray-300 italic">
                  &ldquo;{r.review}&rdquo;
                </p>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`size-4 ${s < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`}
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold text-white">
                  {profile?.full_name ?? "Anonymous"}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
