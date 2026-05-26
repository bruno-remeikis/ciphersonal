"use client"

import { useState, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Lyrics2Content, Lyrics2OrderItem } from "@/lib/data"
import { getSectionColorById } from "@/lib/data"

type Lyrics2DisplayProps = {
  content: Lyrics2Content
  fontSize?: number
  onOrderUpdate?: (newOrder: Lyrics2OrderItem[]) => void
}

export type Lyrics2DisplayRef = {
  expandAll: () => void
  collapseAll: () => void
  resetToDefault: () => void
}

// Componente com ref para controle externo
export const Lyrics2DisplayWithRef = forwardRef<Lyrics2DisplayRef, Lyrics2DisplayProps>(
  function Lyrics2DisplayWithRef({ content, fontSize = 14, onOrderUpdate }, ref) {
    // Estado local de expansão baseado em content.order
    const [expandedState, setExpandedState] = useState<boolean[]>(() =>
      content.order.map(item => item.expanded)
    )

    // ─── FIX ────────────────────────────────────────────────────────────────
    // onOrderUpdate NÃO pode ser chamado dentro de um setter de estado (seja
    // setExpandedState ou qualquer outro), pois isso configura setState de um
    // componente pai durante o ciclo de render/update do filho — o que gera o
    // aviso "Cannot update a component while rendering a different component".
    //
    // Solução: os handlers apenas atualizam o estado local. Um único useEffect
    // observa `expandedState` e notifica o pai DEPOIS que o React terminou de
    // aplicar a atualização, fora do ciclo de render.
    // ────────────────────────────────────────────────────────────────────────
    useEffect(() => {
      if (!onOrderUpdate) return
      const newOrder = content.order.map((item, i) => ({
        ...item,
        expanded: expandedState[i] ?? item.expanded,
      }))
      onOrderUpdate(newOrder)
      // Intencionalmente omitimos onOrderUpdate das deps: a função é recriada
      // a cada render do pai e incluí-la causaria um loop infinito. O eslint
      // pode reclamar; o comentário abaixo suprime o aviso com justificativa.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedState])

    // Mapeia títulos de seção para seus conteúdos e cores
    const sectionMap = useMemo(() => {
      const map = new Map<string, { content: string; colorId?: string }>()
      content.sections.forEach(section => {
        map.set(section.title, { content: section.content, colorId: section.colorId })
      })
      return map
    }, [content.sections])

    // Mapeia quais índices são a primeira ocorrência de cada título
    const firstOccurrenceIndices = useMemo(() => {
      const seen = new Set<string>()
      const indices = new Map<number, boolean>()
      content.order.forEach((item, index) => {
        if (!seen.has(item.title)) {
          seen.add(item.title)
          indices.set(index, true)
        } else {
          indices.set(index, false)
        }
      })
      return indices
    }, [content.order])

    // Handlers — apenas atualizam estado local; o useEffect acima notifica o pai
    const toggleSection = useCallback((index: number) => {
      setExpandedState(prev => prev.map((v, i) => (i === index ? !v : v)))
    }, [])

    const expandAll = useCallback(() => {
      setExpandedState(prev => prev.map(() => true))
    }, [])

    const collapseAll = useCallback(() => {
      setExpandedState(prev => prev.map(() => false))
    }, [])

    const resetToDefault = useCallback(() => {
      const seen = new Set<string>()
      const defaultState = content.order.map(item => {
        if (!seen.has(item.title)) {
          seen.add(item.title)
          return true
        }
        return false
      })
      setExpandedState(defaultState)
    }, [content.order])

    // Expõe as funções via ref
    useImperativeHandle(ref, () => ({
      expandAll,
      collapseAll,
      resetToDefault,
    }), [expandAll, collapseAll, resetToDefault])

    return (
      <div className="flex flex-col">
        {content.order.map((orderItem, index, allOrderItems) => {
          const isFirstOccurrence = firstOccurrenceIndices.get(index) ?? false
          const isExpanded = expandedState[index]
          const sectionData = sectionMap.get(orderItem.title)
          const sectionContent = sectionData?.content || ""
          const colors = getSectionColorById(sectionData?.colorId)
          const repetitions = orderItem.repetitions || 1

          const showContent = isExpanded
          const isLastItem = allOrderItems.length - 1 === index

          return (
            <div
              key={`${orderItem.title}-${index}`}
              className={cn(
                `transition-all duration-200 ${!isLastItem && "border-b"}`,
                colors.bg
              )}
            >
              <button
                onClick={() => toggleSection(index)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left",
                  "hover:opacity-80 transition-opacity"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    colors.badge
                  )}>
                    {orderItem.title}
                  </span>
                  {repetitions > 1 && (
                    <span className={cn(
                      "text-xs font-bold px-1.5 py-0.5 rounded",
                      colors.text,
                      "opacity-80"
                    )}>
                      {repetitions}x
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className={cn("w-4 h-4", colors.text)} />
                ) : (
                  <ChevronDown className={cn("w-4 h-4", colors.text)} />
                )}
              </button>

              {showContent && sectionContent && (
                <div className="px-4 pb-4">
                  <pre
                    className={cn(
                      "whitespace-pre-wrap font-mono leading-relaxed",
                      colors.text
                    )}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {sectionContent}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
)

// Componente simples sem ref (mantido para compatibilidade)
export function Lyrics2Display({ content, fontSize = 14, onOrderUpdate }: Lyrics2DisplayProps) {
  return (
    <Lyrics2DisplayWithRef
      content={content}
      fontSize={fontSize}
      onOrderUpdate={onOrderUpdate}
    />
  )
}