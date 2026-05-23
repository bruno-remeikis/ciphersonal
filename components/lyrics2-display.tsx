"use client"

import { useState, useMemo, useCallback, forwardRef, useImperativeHandle } from "react"
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

    // Mapeia títulos de seção para seus conteúdos e cores
    const sectionMap = useMemo(() => {
      const map = new Map<string, { content: string; colorId?: string }>()
      content.sections.forEach(section => {
        map.set(section.title, { content: section.content, colorId: section.colorId })
      })
      return map
    }, [content.sections])

    // Mapeia quais títulos já foram exibidos
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

    const toggleSection = useCallback((index: number) => {
      setExpandedState(prev => {
        const newState = [...prev]
        newState[index] = !newState[index]
        
        if (onOrderUpdate) {
          const newOrder = content.order.map((item, i) => ({
            ...item,
            expanded: newState[i]
          }))
          onOrderUpdate(newOrder)
        }
        
        return newState
      })
    }, [content.order, onOrderUpdate])

    const expandAll = useCallback(() => {
      setExpandedState(prev => prev.map(() => true))
      if (onOrderUpdate) {
        const newOrder = content.order.map(item => ({ ...item, expanded: true }))
        onOrderUpdate(newOrder)
      }
    }, [content.order, onOrderUpdate])

    const collapseAll = useCallback(() => {
      setExpandedState(prev => prev.map(() => false))
      if (onOrderUpdate) {
        const newOrder = content.order.map(item => ({ ...item, expanded: false }))
        onOrderUpdate(newOrder)
      }
    }, [content.order, onOrderUpdate])

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
      if (onOrderUpdate) {
        const newOrder = content.order.map((item, i) => ({ ...item, expanded: defaultState[i] }))
        onOrderUpdate(newOrder)
      }
    }, [content.order, onOrderUpdate])

    // Expõe as funções via ref
    useImperativeHandle(ref, () => ({
      expandAll,
      collapseAll,
      resetToDefault,
    }), [expandAll, collapseAll, resetToDefault])

    return (
      <div className="flex flex-col">
        {content.order.map((orderItem, index) => {
          const isFirstOccurrence = firstOccurrenceIndices.get(index) ?? false
          const isExpanded = expandedState[index]
          const sectionData = sectionMap.get(orderItem.title)
          const sectionContent = sectionData?.content || ""
          const colors = getSectionColorById(sectionData?.colorId)
          const repetitions = orderItem.repetitions || 1
          
          const showContent = isExpanded
          const showOnlyTitle = !showContent

          return (
            <div
              key={`${orderItem.title}-${index}`}
              className={cn(
                "transition-all duration-200",
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
              
              {showOnlyTitle && !isFirstOccurrence && (
                <div className="px-4 pb-3">
                  <span className={cn("text-sm italic", colors.text, "opacity-70")}>
                    (clique para expandir)
                  </span>
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
