import { NextRequest, NextResponse } from "next/server"
import { generateText, Output } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

// Usa o provider do Google diretamente (funciona localmente com GOOGLE_GENERATIVE_AI_API_KEY)
// gemini-1.5-flash tem boa quota gratuita e é eficiente
const model = google("gemini-1.5-flash")

// Schema para a resposta de letra estruturada
const lyricsResponseSchema = z.object({
  sections: z.array(z.object({
    title: z.string().describe("Nome da seção (ex: Verso 1, Refrão)"),
    content: z.string().describe("Conteúdo da seção com quebras de linha")
  }))
})

// Schema para a resposta de acordes
const chordsResponseSchema = z.object({
  content: z.string().describe("Conteúdo formatado como '[Seção]: acordes, separados, por, vírgula' com quebras de linha entre seções")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { songTitle, artists, type } = body as {
      songTitle: string
      artists: string[]
      type: "lyrics2" | "chords"
    }

    if (!songTitle || !artists?.length || !type) {
      return NextResponse.json(
        { error: "songTitle, artists e type são obrigatórios" },
        { status: 400 }
      )
    }

    if (type === "lyrics2") {
      // Gerar letra estruturada
      const result = await generateText({
        model,
        output: Output.object({ schema: lyricsResponseSchema }),
        prompt: `Você é um assistente especializado em letras de músicas brasileiras e internacionais.

Tarefa: Gere a letra da música "${songTitle}" de ${artists.join(", ")}.

Regras IMPORTANTES:
1. Agrupe em seções usando nomenclatura "Verso 1", "Verso 2", "Refrão", etc.
2. Se um trecho de letra se repete por inteiro em outra parte da música, unifique-os em uma única seção (mesmo que na realidade sejam versos diferentes)
3. Economize onomatopeias e lalações. Se dois trechos seriam idênticos exceto por onomatopeias/lalações, remova as que não se repetem para unificar as seções
4. O Refrão deve ter esse nome exato, não numere como "Refrão 1", "Refrão 2" se o conteúdo for igual
5. Mantenha a formatação original da letra com quebras de linha corretas dentro de cada seção
6. Não adicione informações que não fazem parte da letra (como créditos, comentários, etc)

Retorne a letra organizada em seções.`
      })

      if (result.output) {
        return NextResponse.json({
          type: "lyrics2",
          data: result.output
        })
      }

      return NextResponse.json(
        { error: "Não foi possível gerar a letra" },
        { status: 500 }
      )
    } else {
      // Gerar acordes
      const result = await generateText({
        model,
        output: Output.object({ schema: chordsResponseSchema }),
        prompt: `Você é um assistente especializado em cifras de músicas brasileiras e internacionais.

Tarefa: Gere a cifra da música "${songTitle}" de ${artists.join(", ")}.

Regras IMPORTANTES:
1. Use o formato: "[Nome da Seção]: Acorde1, Acorde2, Acorde3" para cada linha
2. Exemplo de formato:
   [Verso 1]: Am, G, C, F
   [Verso 2]: Am, G, Dm, E
   [Refrão]: C, G, Am, F
3. NÃO repita seções com acordes idênticos - se o Verso 1 e Verso 2 têm os mesmos acordes, liste apenas uma vez como "[Verso]: acordes"
4. Use nomenclatura padrão de acordes (maiúsculo para maior, m para menor, 7 para sétima, etc)
5. Separe cada seção com uma quebra de linha
6. Não adicione informações extras, apenas os acordes organizados por seção

Retorne a cifra completa no formato especificado.`
      })

      if (result.output) {
        return NextResponse.json({
          type: "chords",
          data: result.output
        })
      }

      return NextResponse.json(
        { error: "Não foi possível gerar a cifra" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error generating sheet:", error)
    return NextResponse.json(
      { error: "Erro ao gerar conteúdo com IA" },
      { status: 500 }
    )
  }
}
