import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ServiceCard } from "@/components/reusable/service-card"
import {
  PartyPopper, Music, Camera,
  Image as ImageIcon, Utensils, Palette, Gift, Sparkles, Mic, Lightbulb,
} from "lucide-react"
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

export async function HomeServices() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(6)

  return (
    <section id="services" className="py-16 sm:py-20 bg-gray-950 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4 animate-fade-in-up">
          <h2 className="text-yellow-400 font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
            What We Do
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Our <span className="italic underline decoration-yellow-400 underline-offset-8">Professional</span> Services
          </h3>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            We provide a comprehensive range of event services designed to make your celebration seamless, memorable, and stress-free.
          </p>
        </div>

        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, i) => (
              <div key={service.id} className={`animate-fade-in-up stagger-${(i % 6) + 1}`}>
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
        ) : (
          <p className="text-center text-gray-500 py-12">Loading services&hellip;</p>
        )}

        <div className="mt-12 text-center animate-fade-in-up stagger-6">
          <Link
            href="/services"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-gray-700 px-8 text-sm font-semibold text-white transition-all hover:border-yellow-400 hover:text-yellow-400 active:scale-95"
          >
            View All Services
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
