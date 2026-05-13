import { Music, ListMusic } from "lucide-react"
import { Song } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

export function SongCard({ song, repertoireId }: { song: Song; repertoireId?: number }) {
  const href = repertoireId
    ? `/musicas/${song.id}?from=repertoire&repertoireId=${repertoireId}`
    : `/musicas/${song.id}`

  const hasRepertoires = song.repertoires && song.repertoires.length > 0

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
            {hasRepertoires && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={song.repertoires!.map(r => r.title).join(", ")}>
                <ListMusic className="w-3 h-3" />
                <span className="truncate max-w-[100px]">
                  {song.repertoires!.length === 1
                    ? song.repertoires![0].title
                    : `${song.repertoires!.length} repertórios`}
                </span>
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
