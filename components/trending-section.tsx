"use client"

import useSWR from "swr"
import { Clock, Music, Users, ListMusic } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { fetchLastSeen, swrKeys, type LastSeenResolved } from "@/lib/api"

const typeIcon: Record<LastSeenResolved["type"], React.ReactNode> = {
  song: <Music className="w-3 h-3" />,
  artist: <Users className="w-3 h-3" />,
  repertoire: <ListMusic className="w-3 h-3" />,
}

export function TrendingSection() {
  const { data: rawItems, isLoading } = useSWR(
    swrKeys.lastSeen,
    () => fetchLastSeen()
  )

  // `rawItems` pode conter itens duplicados. Isto gera um papa de itens únicos
  const items = rawItems
    ? [...new Map(rawItems.map(obj => [`${obj.type}-${obj.id}`, obj])).values()]
    : rawItems

  if (isLoading) {
    return (
      <aside className="max-w-7xl mx-auto px-4 mt-2 mb-4" aria-label="Visto por último">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Visto por último
          </h2>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-40 h-12 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>
      </aside>
    )
  }

  if (!items || items.length === 0) return null

  return (
    <aside className="max-w-7xl mx-auto px-4 mt-2 mb-4" aria-label="Visto por último">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Visto por último
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={item.href}
            className="group shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
            aria-label={`${item.label} — ${item.sublabel}`}
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
              {item.coverUrl ? (
                <Image
                  src={item.coverUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <ListMusic className="w-4 h-4 text-primary/30" />
                </div>
              )}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-foreground whitespace-nowrap group-hover:text-primary transition-colors">
                {item.label}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-0.5">
                {typeIcon[item.type]}
                {item.sublabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
