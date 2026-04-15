import { ListMusic, Lock, Globe } from "lucide-react"
import { Repertoire } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

export function RepertoireCard({ repertoire }: { repertoire: Repertoire }) {
  return (
    <Link href={`/repertorios/${repertoire.id}`}>
      <article
        className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
        aria-label={`Repertório: ${repertoire.title}`}
      >
        {/* Cover image */}
        <div className="relative h-36 md:h-40 w-full overflow-hidden bg-muted">
          {repertoire.coverUrl ? (
            <Image
              src={repertoire.coverUrl}
              alt={`Capa do repertório ${repertoire.title}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <ListMusic className="w-12 h-12 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 right-2">
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                repertoire.isPublic
                  ? "bg-emerald-500/90 text-white"
                  : "bg-black/60 text-white"
              }`}
            >
              {repertoire.isPublic ? (
                <><Globe className="w-3 h-3" /> Público</>
              ) : (
                <><Lock className="w-3 h-3" /> Privado</>
              )}
            </span>
          </div>

          {/* Song count badge */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            <ListMusic className="w-3 h-3" />
            {repertoire.songIds.length} músicas
          </div>
        </div>

        {/* Body */}
        <div className="p-3 md:p-4">
          <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {repertoire.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {repertoire.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-medium">
            por <span className="text-primary">@{repertoire.owner}</span>
          </p>
        </div>
      </article>
    </Link>
  )
}
