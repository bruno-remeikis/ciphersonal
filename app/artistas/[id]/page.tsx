import { ArtistPageClient } from "@/components/artist-page-client"
import { fetchArtistDetail } from "@/lib/api"
import { requireAuth } from "@/lib/require-auth"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ArtistPage({ params }: Props) {
  await requireAuth()
  
  const { id } = await params

  let data
  try {
    data = await fetchArtistDetail(id)
  } catch {
    notFound()
  }

  return <ArtistPageClient artist={data.artist} initialSongs={data.songs} />
}
