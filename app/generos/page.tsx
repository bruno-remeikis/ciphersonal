import { GenresListClient } from "@/components/genres-list-client"

export default async function GenerosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <GenresListClient initialQuery={q} />
}
