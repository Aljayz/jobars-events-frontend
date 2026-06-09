import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  title: string
  description: string
  icon: React.ReactNode
  price?: number | null
  category?: string
  features?: string[]
  className?: string
}

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

export function ServiceCard({
  title,
  description,
  icon,
  price,
  category,
  features,
  className,
}: ServiceCardProps) {
  return (
    <Card
      className={cn(
        'bg-gray-900 border-gray-800 hover:border-yellow-400/50 transition-all group duration-300 h-full relative overflow-hidden',
        className,
      )}
    >
      {category && (
        <div className="absolute top-3 right-3 rounded-full bg-yellow-400/10 px-3 py-0.5 text-[10px] font-medium uppercase tracking-wider text-yellow-400">
          {categoryLabels[category] ?? category}
        </div>
      )}
      <CardHeader>
        <div className='size-14 sm:size-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-yellow-400/10 transition-colors'>
          {icon}
        </div>
        <CardTitle className='text-lg sm:text-xl text-white group-hover:text-yellow-400 transition-colors'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className='text-sm sm:text-base text-gray-400 leading-relaxed'>
          {description}
        </p>
        {features && features.length > 0 && (
          <ul className="space-y-1 pt-1">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="size-1 rounded-full bg-yellow-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
        {price != null && (
          <p className="pt-2 text-lg font-bold text-yellow-400">
            ₱{price.toLocaleString()}
            <span className="text-xs font-normal text-gray-500 ml-1">starting price</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
