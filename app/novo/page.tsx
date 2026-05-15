import { NewItemPageClient } from "@/components/new-item-page-client"
import { requireAuth } from "@/lib/require-auth"

type Props = {
  searchParams: Promise<{ tipo?: string; edit?: string }>
}

export default async function NovoPage({ searchParams }: Props) {
  await requireAuth()
  const { tipo, edit } = await searchParams
  return <NewItemPageClient initialTipo={tipo} editId={edit} />
}
