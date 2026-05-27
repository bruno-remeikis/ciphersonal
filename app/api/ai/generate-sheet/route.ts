import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

// Groq oferece tier gratuito generoso: 30 RPM, 6000 TPM
// Llama 3.3 70B é um modelo potente disponível gratuitamente
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})
const model = groq("llama-3.3-70b-versatile")

// Função auxiliar para extrair JSON de uma resposta de texto
function extractJSON(text: string): unknown {
  // Tenta encontrar um bloco JSON na resposta
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                    text.match(/```\s*([\s\S]*?)\s*```/) ||
                    text.match(/(\{[\s\S]*\})/)
  
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {
      // Se falhar, tenta parsear o texto inteiro
    }
  }
  
  // Tenta parsear o texto inteiro como JSON
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

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
        prompt: `Você é um assistente especializado em letras de músicas brasileiras e internacionais.

Tarefa: Gere a letra da música "${songTitle}" de ${artists.join(", ")}.

Regras IMPORTANTES:
1. Agrupe em seções usando nomenclatura "Verso 1", "Verso 2", "Refrão", etc.
2. Se um trecho de letra se repete por inteiro em outra parte da música, unifique-os em uma única seção (mesmo que na realidade sejam versos diferentes)
3. Economize onomatopeias e lalações. Se dois trechos seriam idênticos exceto por onomatopeias/lalações, remova as que não se repetem para unificar as seções
4. O Refrão deve ter esse nome exato, não numere como "Refrão 1", "Refrão 2" se o conteúdo for igual
5. Mantenha a formatação original da letra com quebras de linha corretas dentro de cada seção
6. Não adicione informações que não fazem parte da letra (como créditos, comentários, etc)

RESPONDA APENAS com um JSON válido no seguinte formato (sem explicações antes ou depois):
{
  "sections": [
    { "title": "Verso 1", "content": "linha 1\\nlinha 2\\nlinha 3" },
    { "title": "Refrão", "content": "linha 1\\nlinha 2" }
  ]
}

Use \\n para quebras de linha dentro do content. Retorne APENAS o JSON, nada mais.`
      })

      const parsed = extractJSON(result.text) as { sections?: Array<{ title: string; content: string }> } | null

      if (parsed?.sections) {
        return NextResponse.json({
          type: "lyrics2",
          data: parsed
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

RESPONDA APENAS com um JSON válido no seguinte formato (sem explicações antes ou depois):
{
  "content": "[Verso 1]: Am, G, C, F\\n[Refrão]: C, G, Am, F"
}

Use \\n para quebras de linha. Retorne APENAS o JSON, nada mais.`
      })

      const parsed = extractJSON(result.text) as { content?: string } | null

      if (parsed?.content) {
        return NextResponse.json({
          type: "chords",
          data: parsed
        })
      }

      return NextResponse.json(
        { error: "Não foi possível gerar a cifra" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error generating sheet:", error)
    const message = error instanceof Error ? error.message : "Erro ao gerar conteúdo com IA"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
