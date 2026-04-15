import { SongPageClient } from "@/components/song-page-client"
import { fetchSong } from "@/lib/api"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; repertoireId?: string }>
}

export default async function SongPage({ params, searchParams }: Props) {
  const { id } = await params
  const { from, repertoireId } = await searchParams

  let song
  try {
    song = await fetchSong(id)
  } catch {
    notFound()
  }

  return (
    <SongPageClient
      song={song}
      fromRepertoire={from === "repertoire" && repertoireId ? repertoireId : undefined}
    />
  )
}
