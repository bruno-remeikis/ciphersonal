import { GenresListClient } from "@/components/genres-list-client"
import { requireAuth } from "@/lib/require-auth"

export default async function GenerosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAuth()
  const { q } = await searchParams
  return <GenresListClient initialQuery={q} />
}
