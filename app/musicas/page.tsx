import { SongsListClient } from "@/components/songs-list-client"
import { Suspense } from "react"

export default function SongsPage() {
  return (
    <Suspense fallback={null}>
      <SongsListClient />
    </Suspense>
  )
}
