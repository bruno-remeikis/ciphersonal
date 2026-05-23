"use client"

import { useState, useMemo, useCallback } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Lyrics2Content, Lyrics2OrderItem } from "@/lib/data"

// Cores por tipo de seção
const SECTION_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  "Verso": { 
    bg: "bg-blue-50 dark:bg-blue-950/30", 
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
  },
  "Refrão": { 
    bg: "bg-amber-50 dark:bg-amber-950/30", 
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-100",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
  },
  "Pré-Refrão": { 
    bg: "bg-purple-50 dark:bg-purple-950/30", 
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-900 dark:text-purple-100",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
  },
  "Ponte": { 
    bg: "bg-emerald-50 dark:bg-emerald-950/30", 
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-100",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
  },
  "Intro": { 
    bg: "bg-rose-50 dark:bg-rose-950/30", 
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-900 dark:text-rose-100",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
  },
  "Outro": { 
    bg: "bg-slate-50 dark:bg-slate-950/30", 
    border: "border-slate-200 dark:border-slate-800",
    text: "text-slate-900 dark:text-slate-100",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
  },
}

// Cor padrão para seções personalizadas
const DEFAULT_COLORS = [
  { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", text: "text-cyan-900 dark:text-cyan-100", badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300" },
  { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", text: "text-pink-900 dark:text-pink-100", badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300" },
  { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-900 dark:text-indigo-100", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" },
  { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-900 dark:text-orange-100", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" },
  { bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800", text: "text-teal-900 dark:text-teal-100", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" },
]

function getSectionColor(title: string, customColorIndex: Map<string, number>) {
  // Remove números do título para pegar a cor base (ex: "Verso 1" -> "Verso")
  const baseTitle = title.replace(/\s*\d+$/, "").trim()
  
  if (SECTION_COLORS[baseTitle]) {
    return SECTION_COLORS[baseTitle]
  }
  
  // Para títulos personalizados, atribui uma cor consistente
  if (!customColorIndex.has(baseTitle)) {
    customColorIndex.set(baseTitle, customColorIndex.size % DEFAULT_COLORS.length)
  }
  
  return DEFAULT_COLORS[customColorIndex.get(baseTitle)!]
}

type Lyrics2DisplayProps = {
  content: Lyrics2Content
  fontSize?: number
  onOrderUpdate?: (newOrder: Lyrics2OrderItem[]) => void
}

export function Lyrics2Display({ content, fontSize = 14, onOrderUpdate }: Lyrics2DisplayProps) {
  // Estado local de expansão baseado em content.order
  const [expandedState, setExpandedState] = useState<boolean[]>(() => 
    content.order.map(item => item.expanded)
  )

  // Mapeia títulos de seção para seus conteúdos
  const sectionMap = useMemo(() => {
    const map = new Map<string, string>()
    content.sections.forEach(section => {
      map.set(section.title, section.content)
    })
    return map
  }, [content.sections])

  // Mapeia quais títulos já foram exibidos (para mostrar conteúdo apenas na primeira vez)
  const firstOccurrenceIndices = useMemo(() => {
    const seen = new Set<string>()
    const indices = new Map<number, boolean>()
    
    content.order.forEach((item, index) => {
      if (!seen.has(item.title)) {
        seen.add(item.title)
        indices.set(index, true) // É a primeira ocorrência
      } else {
        indices.set(index, false) // Não é a primeira ocorrência
      }
    })
    
    return indices
  }, [content.order])

  // Índice de cores para seções personalizadas
  const customColorIndex = useMemo(() => new Map<string, number>(), [])

  const toggleSection = useCallback((index: number) => {
    setExpandedState(prev => {
      const newState = [...prev]
      newState[index] = !newState[index]
      
      // Notifica a mudança para persistência
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
    // Padrão: primeira ocorrência de cada título expandida, resto colapsado
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

  return (
    <div className="flex flex-col gap-2">
      {/* Seções */}
      {content.order.map((orderItem, index) => {
        const isFirstOccurrence = firstOccurrenceIndices.get(index) ?? false
        const isExpanded = expandedState[index]
        const sectionContent = sectionMap.get(orderItem.title) || ""
        const colors = getSectionColor(orderItem.title, customColorIndex)
        const repetitions = orderItem.repetitions || 1
        
        // Se é primeira ocorrência: mostra content quando expandido, title quando colapsado
        // Se não é primeira ocorrência: mostra title quando colapsado, content quando expandido
        const showContent = isFirstOccurrence ? isExpanded : isExpanded
        const showOnlyTitle = !showContent

        return (
          <div
            key={`${orderItem.title}-${index}`}
            className={cn(
              "rounded-lg border transition-all duration-200",
              colors.bg,
              colors.border
            )}
          >
            <button
              onClick={() => toggleSection(index)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 text-left",
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

// Exportar funções de controle para uso externo (no menu)
export const lyrics2Controls = {
  expandAll: Symbol('expandAll'),
  collapseAll: Symbol('collapseAll'),
  resetToDefault: Symbol('resetToDefault'),
}

export type Lyrics2DisplayRef = {
  expandAll: () => void
  collapseAll: () => void
  resetToDefault: () => void
}

// Componente com ref para controle externo
import { forwardRef, useImperativeHandle } from "react"

export const Lyrics2DisplayWithRef = forwardRef<Lyrics2DisplayRef, Lyrics2DisplayProps>(
  function Lyrics2DisplayWithRef({ content, fontSize = 14, onOrderUpdate }, ref) {
    // Estado local de expansão baseado em content.order
    const [expandedState, setExpandedState] = useState<boolean[]>(() => 
      content.order.map(item => item.expanded)
    )

    // Mapeia títulos de seção para seus conteúdos
    const sectionMap = useMemo(() => {
      const map = new Map<string, string>()
      content.sections.forEach(section => {
        map.set(section.title, section.content)
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

    const customColorIndex = useMemo(() => new Map<string, number>(), [])

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
      <div className="flex flex-col gap-2">
        {content.order.map((orderItem, index) => {
          const isFirstOccurrence = firstOccurrenceIndices.get(index) ?? false
          const isExpanded = expandedState[index]
          const sectionContent = sectionMap.get(orderItem.title) || ""
          const colors = getSectionColor(orderItem.title, customColorIndex)
          const repetitions = orderItem.repetitions || 1
          
          const showContent = isFirstOccurrence ? isExpanded : isExpanded
          const showOnlyTitle = !showContent

          return (
            <div
              key={`${orderItem.title}-${index}`}
              className={cn(
                "rounded-lg border transition-all duration-200",
                colors.bg,
                colors.border
              )}
            >
              <button
                onClick={() => toggleSection(index)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-left",
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
