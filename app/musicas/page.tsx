import { SongsListClient } from "@/components/songs-list-client"
import { requireAuth } from "@/lib/require-auth"
import { Suspense } from "react"

export default async function SongsPage() {
  await requireAuth()
  
  return (
    <Suspense fallback={null}>
      <SongsListClient />
    </Suspense>
  )
}
