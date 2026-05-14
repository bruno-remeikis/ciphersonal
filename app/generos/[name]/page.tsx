import { GenrePageClient } from "@/components/genre-page-client"

export default async function GeneroPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { name } = await params
  const { q } = await searchParams
  const decodedName = decodeURIComponent(name)
  
  return <GenrePageClient genreName={decodedName} initialQuery={q} />
}
