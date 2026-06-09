import type { Metadata } from "next"
import Hero from "@/components/section/hero";
import { HomeServices } from "@/components/section/home-services";
import { Stats } from "@/components/section/stats";
import { Testimonials } from "@/components/section/testimonials";
import Contact from "@/components/section/contact";
import Map from "@/components/section/map";

export const metadata: Metadata = {
  title: "Jobars Events",
  description: "Premier Event Services in Bayugan City — weddings, corporate events, and social gatherings.",
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HomeServices />
      <Stats />
      <Testimonials />
      <Contact />
      <Map />
    </main>
  );
}
