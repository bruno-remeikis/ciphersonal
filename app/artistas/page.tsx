import { ArtistsListClient } from "@/components/artists-list-client"
import { Suspense } from "react"

export default function ArtistsPage() {
  return (
    <Suspense fallback={null}>
      <ArtistsListClient />
    </Suspense>
  )
}
