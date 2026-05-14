import { GenrePageClient } from "@/components/genre-page-client"
import { requireAuth } from "@/lib/require-auth"

export default async function GeneroPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>
  searchParams: Promise<{ q?: string }>
}) {
  await requireAuth()
  
  const { name } = await params
  const { q } = await searchParams
  const decodedName = decodeURIComponent(name)
  
  return <GenrePageClient genreName={decodedName} initialQuery={q} />
}
