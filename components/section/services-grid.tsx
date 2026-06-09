import { createClient } from "@/utils/supabase/server"
import {
  PartyPopper, Music, Camera,
  Image as ImageIcon, Utensils, Palette, Gift, Sparkles, Mic, Lightbulb,
} from "lucide-react"
import { ServiceCard } from "@/components/reusable/service-card"
import type { ReactNode } from "react"

const iconMap: Record<string, ReactNode> = {
  catering: <Utensils className="size-7 sm:size-8 text-yellow-400" />,
  sound_system: <Music className="size-7 sm:size-8 text-yellow-400" />,
  photo_video: <Camera className="size-7 sm:size-8 text-yellow-400" />,
  photo_booth: <ImageIcon className="size-7 sm:size-8 text-yellow-400" />,
  souvenirs: <Gift className="size-7 sm:size-8 text-yellow-400" />,
  invitations: <Palette className="size-7 sm:size-8 text-yellow-400" />,
  lights: <Lightbulb className="size-7 sm:size-8 text-yellow-400" />,
  styling: <Palette className="size-7 sm:size-8 text-yellow-400" />,
  makeup: <Sparkles className="size-7 sm:size-8 text-yellow-400" />,
  host: <Mic className="size-7 sm:size-8 text-yellow-400" />,
}

const fallbackIcon = <PartyPopper className="size-7 sm:size-8 text-yellow-400" />

const categoryOrder = [
  "catering",
  "sound_system",
  "photo_video",
  "photo_booth",
  "souvenirs",
  "invitations",
  "lights",
  "styling",
  "makeup",
  "host",
] as const

const categoryLabels: Record<string, string> = {
  catering: "Catering",
  sound_system: "Sound & Lights",
  photo_video: "Photo & Video",
  photo_booth: "Photo Booth",
  souvenirs: "Souvenirs",
  invitations: "Invitations",
  lights: "Lighting",
  styling: "Styling",
  makeup: "Makeup & Hair",
  host: "Host & MC",
}

interface ServiceRecord {
  id: string
  name: string
  category: string
  description: string | null
  base_price: number | null
}

export async function ServicesGrid() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category")

  const grouped: Record<string, ServiceRecord[]> = {}
  for (const s of services ?? []) {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  }

  const categories = categoryOrder.filter((c) => grouped[c])
  if (categories.length === 0) {
    return <p className="text-center text-gray-500 py-12">No services available yet.</p>
  }

  return (
    <>
      {categories.map((cat, ci) => {
        const items = grouped[cat]
        return (
          <section key={cat} className="border-b border-gray-800/50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4">
              <h2
                className={`mb-10 text-2xl font-bold text-white sm:text-3xl animate-fade-in-up stagger-${(ci % 6) + 1}`}
              >
                {categoryLabels[cat] ?? cat}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((service, si) => (
                  <div
                    key={service.id}
                    className={`animate-fade-in-up stagger-${((ci * 3 + si) % 6) + 1}`}
                  >
                    <ServiceCard
                      title={service.name}
                      description={service.description ?? "No description available."}
                      icon={iconMap[service.category] ?? fallbackIcon}
                      price={service.base_price}
                      category={service.category}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
