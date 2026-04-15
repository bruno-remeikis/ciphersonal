import { NewItemPageClient } from "@/components/new-item-page-client"

type Props = {
  searchParams: Promise<{ tipo?: string; edit?: string }>
}

export default async function NovoPage({ searchParams }: Props) {
  const { tipo, edit } = await searchParams
  return <NewItemPageClient initialTipo={tipo} editId={edit} />
}
