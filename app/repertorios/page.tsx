import { RepertoiresListClient } from "@/components/repertoires-list-client"
import { Suspense } from "react"

export default function RepertoiresPage() {
  return (
    <Suspense fallback={null}>
      <RepertoiresListClient />
    </Suspense>
  )
}
