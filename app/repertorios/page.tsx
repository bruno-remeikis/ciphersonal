import { RepertoiresListClient } from "@/components/repertoires-list-client"
import { requireAuth } from "@/lib/require-auth"
import { Suspense } from "react"

export default async function RepertoiresPage() {
  await requireAuth()
  
  return (
    <Suspense fallback={null}>
      <RepertoiresListClient />
    </Suspense>
  )
}
