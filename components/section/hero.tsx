import { createClient } from "@/utils/supabase/server"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'

async function Hero() {
  const supabase = await createClient()

  const [{ count: eventCount }, { data: upcoming }] = await Promise.all([
    supabase.from("events_bookings").select("*", { count: "exact", head: true }),
    supabase.from("events_bookings").select("event_date").gte("event_date", new Date().toISOString().split("T")[0]).order("event_date", { ascending: true }).limit(1),
  ])

  const totalEvents = eventCount ?? 500
  const nextSlot = upcoming?.[0]?.event_date
    ? new Date(upcoming[0].event_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "This Month"

  return (
    <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4 pt-20'>
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 -left-20 size-72 bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 size-96 bg-yellow-400/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className='max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10'>
            <div className='flex flex-col items-center lg:items-start text-center lg:text-left gap-y-8'>
                <div className='flex flex-col items-center lg:items-start gap-6'>
                    <div className="relative w-80 sm:w-[500px] h-24 sm:h-40 animate-float">
                        <Image 
                            src="/images/jobars-events-logo.png" 
                            alt="Jobars Events Logo" 
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 640px) 320px, 500px"
                        />
                    </div>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-medium'>
                        <Star className='size-4 fill-yellow-400' />
                        <span>Premier Event Services in Bayugan City</span>
                    </div>
                </div>
                
                <h1 className='text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight'>
                    Make Your <span className='text-yellow-400 italic'>Special Moments</span> Unforgettable
                </h1>
                
                <p className='text-lg sm:text-xl text-gray-400 max-w-xl'>
                    From elegant weddings to professional corporate events, Jobars Events provides full-service planning and coordination to bring your vision to life.
                </p>
                
                <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4'>
                    <Link href="/auth/sign-up">
                        <Button className='w-full sm:w-auto h-12 px-8 text-black bg-yellow-400 hover:bg-yellow-500 font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95'>
                            Book Now
                        </Button>
                    </Link>
                    <Link href="/services">
                        <Button variant="outline" className='w-full sm:w-auto h-12 px-8 border-gray-700 text-white hover:bg-gray-800 font-semibold text-lg rounded-full'>
                            Our Services
                        </Button>
                    </Link>
                </div>

                    <div className='flex items-center gap-6 pt-8 border-t border-gray-800 w-full lg:w-auto'>
                        <div className='flex -space-x-3'>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className='size-10 rounded-full border-2 border-black bg-gray-900 flex items-center justify-center overflow-hidden relative'>
                                    <Image 
                                        src="/images/jobars-logo.png" 
                                        alt="Logo" 
                                        fill
                                        className="object-cover opacity-50"
                                        sizes="40px"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className='text-sm'>
                            <p className='text-white font-bold'>{totalEvents}+ Events</p>
                            <p className='text-gray-500'>Successfully Managed</p>
                        </div>
                    </div>
            </div>

            <div className='relative hidden lg:block'>
                {/* Visual Placeholder for Event Image */}
                <div className='aspect-square rounded-3xl bg-gradient-to-tr from-gray-800 to-gray-700 border border-gray-600 shadow-2xl overflow-hidden relative group'>
                    <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop")] bg-cover bg-center opacity-80 group-hover:scale-110 transition-transform duration-700'></div>
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent'></div>
                    
                    <div className='absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10'>
                        <p className='text-yellow-400 font-bold mb-1'>Featured Event</p>
                        <h3 className='text-xl font-bold text-white'>Elegant Wedding Reception</h3>
                        <p className='text-sm text-gray-300'>Bayugan City Convention Center</p>
                    </div>
                </div>
                
                {/* Floating Decorative Card */}
                <div className='absolute -bottom-6 -left-6 p-4 rounded-xl bg-yellow-400 shadow-xl animate-float'>
                    <div className='flex items-center gap-3'>
                        <div className='size-10 rounded-lg bg-gray-950 flex items-center justify-center'>
                            <ArrowRight className='text-yellow-400 size-6' />
                        </div>
                        <div>
                            <p className='text-[10px] text-black/60 font-bold uppercase tracking-wider'>Next Available Slot</p>
                            <p className='text-sm text-black font-black'>{nextSlot}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Hero
