import { NextRequest, NextResponse } from "next/server"
import { generateText, gateway, Output, isStepCount } from "ai"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const suggestionSchema = z.object({
  songs: z
    .array(
      z.object({
        title: z.string().describe("Título da música"),
        artists: z.array(z.string()).min(1).describe("Nome(s) do(s) artista(s) ou banda(s)"),
        genres: z.array(z.string()).min(1).describe("Gênero(s) musical(is) da música"),
      })
    )
    .length(5)
    .describe("Lista com exatamente 5 músicas reais e existentes"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const sessionExclude: string[] = Array.isArray(body?.exclude)
      ? body.exclude.filter((x: unknown): x is string => typeof x === "string")
      : []

    const existingSongs = await prisma.song.findMany({
      select: { title: true, artists: true },
    })

    const existingList = existingSongs.map((s) => `${s.title} - ${s.artists.join(", ")}`)
    const excludeList = Array.from(new Set([...existingList, ...sessionExclude]))

    const { output } = await generateText({
      model: "openai/gpt-5.4-mini",
      tools: {
        web_search: gateway.tools.perplexitySearch(),
      },
      stopWhen: isStepCount(6),
      output: Output.object({ schema: suggestionSchema }),
      system:
        "Você é um assistente musical que busca na internet músicas reais e conhecidas para sugerir em um catálogo de cifras. " +
        "Use a ferramenta de busca para confirmar que as músicas realmente existem antes de sugeri-las. " +
        "Nunca invente músicas, artistas ou gêneros.",
      prompt:
        `Busque na internet e sugira exatamente 5 músicas reais e populares (de qualquer gênero) que NÃO estejam na lista de exclusão abaixo. ` +
        `Para cada música, retorne o título, o(s) artista(s) e o(s) gênero(s) musical(is). ` +
        `Não repita nenhuma música da lista de exclusão (mesma música ou mesmo título+artista já usados).\n\n` +
        `Lista de exclusão (não sugerir estas músicas):\n${excludeList.length > 0 ? excludeList.join("\n") : "(nenhuma)"}`,
    })

    return NextResponse.json({ songs: output.songs })
  } catch (error) {
    console.error("Error generating song suggestions:", error)
    return NextResponse.json({ error: "Failed to generate song suggestions" }, { status: 500 })
  }
}
