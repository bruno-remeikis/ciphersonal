import { Music, ListMusic } from "lucide-react"
import { Song } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

export function SongCard({ song, repertoireId }: { song: Song; repertoireId?: number }) {
  const href = repertoireId
    ? `/musicas/${song.id}?from=repertoire&repertoireId=${repertoireId}`
    : `/musicas/${song.id}`

  const repertoires = song.repertoires || []

  return (
    <Link href={href}>
      <article
        className="group flex items-center gap-3 p-3 md:p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
        aria-label={`${song.title} por ${song.artists[0]}`}
      >
        {/* Cover */}
        <div className="relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted">
          {song.coverUrl ? (
            <Image
              src={song.coverUrl}
              alt={`Capa de ${song.title}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Music className="w-6 h-6 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Music className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
            {song.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5">
            {song.artists[0]}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {song.genres.map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Repertoires */}
        {repertoires.length > 0 && (
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 max-w-[120px]">
            {repertoires.slice(0, 2).map((rep) => (
              <span
                key={rep.id}
                className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-full"
                title={rep.title}
              >
                <ListMusic className="w-3 h-3 shrink-0" />
                <span className="truncate">{rep.title}</span>
              </span>
            ))}
            {repertoires.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{repertoires.length - 2}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  )
}
