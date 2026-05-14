import { Music2 } from "lucide-react"
import Link from "next/link"

export type Genre = {
  name: string
  songCount: number
}

export function GenreCard({ genre }: { genre: Genre }) {
  return (
    <Link href={`/generos/${encodeURIComponent(genre.name)}`}>
      <article
        className="group flex items-center gap-3 p-3 md:p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
        aria-label={`${genre.name} - ${genre.songCount} músicas`}
      >
        {/* Icon */}
        <div className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Music2 className="w-6 h-6 text-primary/70 group-hover:scale-110 transition-transform duration-300" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
            {genre.name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5">
            {genre.songCount} {genre.songCount === 1 ? "música" : "músicas"}
          </p>
        </div>
      </article>
    </Link>
  )
}
