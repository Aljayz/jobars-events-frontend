import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import { User } from "lucide-react"

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  staff: "Coordinator",
}

export async function TeamGrid() {
  const supabase = await createClient()
  const { data: team } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .in("role", ["admin", "manager", "staff"])
    .order("role", { ascending: true })
    .limit(8)

  if (!team || team.length === 0) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {team.map((member, i) => (
        <div
          key={member.id}
          className={`group flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900/30 p-6 text-center transition-all hover:border-yellow-400/30 hover:bg-gray-900/60 animate-fade-in-up stagger-${(i % 6) + 1}`}
        >
          <div className="mb-4 flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-gray-700 bg-gray-800 relative">
            {member.avatar_url ? (
              <Image
                src={member.avatar_url}
                alt={member.full_name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <User className="size-8 text-gray-500" />
            )}
          </div>
          <h3 className="text-base font-bold text-white">{member.full_name}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-yellow-400">
            {roleLabels[member.role] ?? member.role}
          </p>
        </div>
      ))}
    </div>
  )
}
