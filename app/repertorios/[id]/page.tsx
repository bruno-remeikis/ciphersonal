import { RepertoirePageClient } from "@/components/repertoire-page-client"
import { fetchRepertoireDetail } from "@/lib/api"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
}

export default async function RepertoirePage({ params }: Props) {
  const { id } = await params

  let data
  try {
    data = await fetchRepertoireDetail(id)
  } catch {
    notFound()
  }

  return <RepertoirePageClient repertoire={data.repertoire} initialSongs={data.songs} />
}
