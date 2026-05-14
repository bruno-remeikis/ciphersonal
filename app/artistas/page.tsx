import { ArtistsListClient } from "@/components/artists-list-client"
import { requireAuth } from "@/lib/require-auth"
import { Suspense } from "react"

export default async function ArtistsPage() {
  await requireAuth()
  
  return (
    <Suspense fallback={null}>
      <ArtistsListClient />
    </Suspense>
  )
}
