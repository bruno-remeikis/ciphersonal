import { BadgeCheck, Music, User } from "lucide-react"
import { Artist } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artistas/${artist.id}`}>
      <article
        className="group flex flex-col items-center gap-3 p-4 md:p-5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer text-center"
        aria-label={`Artista: ${artist.name}`}
      >
        {/* Avatar */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all duration-200">
          {artist.avatarUrl ? (
            <Image
              src={artist.avatarUrl}
              alt={`Foto de ${artist.name}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <User className="w-8 h-8 text-primary/50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex items-center gap-1">
            <h3 className="text-sm md:text-base font-semibold text-foreground truncate max-w-[140px] group-hover:text-primary transition-colors">
              {artist.name}
            </h3>
            {artist.verified && (
              <BadgeCheck className="w-4 h-4 text-primary shrink-0" aria-label="Artista verificado" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{artist.genre}</p>
        </div>

        {/* Stats */}
        <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-primary">
            <Music className="w-3.5 h-3.5" />
            <span className="text-sm font-bold">{artist.songCount}</span>
          </div>
          <span className="text-xs text-muted-foreground">músicas</span>
        </div>
      </article>
    </Link>
  )
}
