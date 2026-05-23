"use client"

import { useState, useCallback } from "react"
import { Plus, Trash2, GripVertical, ChevronDown, Copy, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Lyrics2Content, Lyrics2Section, Lyrics2OrderItem } from "@/lib/data"

// Opções pré-definidas de seção
const PREDEFINED_SECTIONS = ["Verso", "Refrão", "Pré-Refrão", "Ponte", "Intro", "Outro"]

type Lyrics2EditorProps = {
  content: Lyrics2Content
  onChange: (content: Lyrics2Content) => void
}

export function Lyrics2Editor({ content, onChange }: Lyrics2EditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Encontra a próxima numeração para um título base
  const getNextNumber = useCallback((baseTitle: string) => {
    const regex = new RegExp(`^${baseTitle}(\\s*\\d+)?$`)
    const matches = content.sections
      .filter(s => regex.test(s.title))
      .map(s => {
        const match = s.title.match(/\d+$/)
        return match ? parseInt(match[0]) : 1
      })
    
    if (matches.length === 0) return null
    return Math.max(...matches) + 1
  }, [content.sections])

  // Renumera seções existentes quando necessário
  const renumberSections = useCallback((sections: Lyrics2Section[], newTitle: string): Lyrics2Section[] => {
    const baseTitle = newTitle.replace(/\s*\d+$/, "").trim()
    
    // Conta quantas seções com esse título base existem
    const existingCount = sections.filter(s => 
      s.title === baseTitle || s.title.match(new RegExp(`^${baseTitle}\\s+\\d+$`))
    ).length

    if (existingCount === 0) {
      return sections
    }

    // Se já existe uma, renumera a existente para "1" 
    let counter = 1
    return sections.map(section => {
      if (section.title === baseTitle) {
        return { ...section, title: `${baseTitle} ${counter++}` }
      }
      if (section.title.match(new RegExp(`^${baseTitle}\\s+\\d+$`))) {
        return { ...section, title: `${baseTitle} ${counter++}` }
      }
      return section
    })
  }, [])

  // Adiciona nova seção
  const addSection = useCallback((baseTitle: string, isRepeat: boolean = false, repetitions: number = 1) => {
    if (isRepeat) {
      // Verifica se a última seção na ordem é a mesma
      const lastOrderItem = content.order[content.order.length - 1]
      if (lastOrderItem && lastOrderItem.title === baseTitle) {
        // Incrementa as repetições da última seção ao invés de adicionar nova
        const newOrder = content.order.map((item, index) => 
          index === content.order.length - 1 
            ? { ...item, repetitions: (item.repetitions || 1) + 1 }
            : item
        )
        onChange({ ...content, order: newOrder })
      } else {
        // Adiciona nova entrada na ordem
        const newOrder: Lyrics2OrderItem[] = [...content.order, { title: baseTitle, expanded: false, repetitions }]
        onChange({ ...content, order: newOrder })
      }
    } else {
      // Cria nova seção
      let finalTitle = baseTitle
      let newSections = [...content.sections]
      
      // Verifica se precisa renumerar
      const existingSection = newSections.find(s => 
        s.title === baseTitle || s.title.match(new RegExp(`^${baseTitle}\\s+\\d+$`))
      )
      
      if (existingSection) {
        // Renumera existentes
        newSections = renumberSections(newSections, baseTitle)
        const nextNum = getNextNumber(baseTitle)
        finalTitle = nextNum ? `${baseTitle} ${nextNum}` : baseTitle
      }
      
      newSections.push({ title: finalTitle, content: "" })
      
      // Verifica se a última seção na ordem tem o mesmo título base
      const lastOrderItem = content.order[content.order.length - 1]
      const lastOrderBaseTitle = lastOrderItem?.title.replace(/\s*\d+$/, "").trim()
      const newBaseTitle = finalTitle.replace(/\s*\d+$/, "").trim()
      
      // Atualiza order com o novo título
      let newOrder: Lyrics2OrderItem[] = content.order.map(item => {
        // Atualiza títulos renumerados na ordem também
        const itemBaseTitle = item.title.replace(/\s*\d+$/, "").trim()
        if (itemBaseTitle === newBaseTitle && existingSection) {
          // Encontra o novo título correspondente
          const matchingSection = newSections.find(s => 
            s.title.replace(/\s*\d+$/, "").trim() === itemBaseTitle
          )
          if (matchingSection && matchingSection.title !== item.title) {
            return { ...item, title: matchingSection.title }
          }
        }
        return item
      })
      
      // Se a última seção tem o mesmo título base, incrementa repetições
      if (lastOrderBaseTitle === newBaseTitle && lastOrderItem) {
        newOrder = newOrder.map((item, index) => 
          index === newOrder.length - 1 
            ? { ...item, repetitions: (item.repetitions || 1) + 1 }
            : item
        )
      } else {
        newOrder.push({ title: finalTitle, expanded: true, repetitions: 1 })
      }
      
      onChange({ sections: newSections, order: newOrder })
    }
    
    setShowAddMenu(false)
    setShowCustomInput(false)
    setCustomTitle("")
  }, [content, onChange, getNextNumber, renumberSections])

  // Adiciona seção personalizada
  const addCustomSection = useCallback(() => {
    if (!customTitle.trim()) return
    addSection(customTitle.trim())
  }, [customTitle, addSection])

  // Atualiza conteúdo de uma seção
  const updateSectionContent = useCallback((title: string, newContent: string) => {
    const newSections = content.sections.map(section =>
      section.title === title ? { ...section, content: newContent } : section
    )
    onChange({ ...content, sections: newSections })
  }, [content, onChange])

  // Remove seção
  const removeSection = useCallback((title: string) => {
    const newSections = content.sections.filter(s => s.title !== title)
    const newOrder = content.order.filter(item => item.title !== title)
    onChange({ sections: newSections, order: newOrder })
  }, [content, onChange])

  // Remove item da ordem (mas mantém a seção)
  const removeFromOrder = useCallback((index: number) => {
    const newOrder = content.order.filter((_, i) => i !== index)
    onChange({ ...content, order: newOrder })
  }, [content, onChange])

  // Move item na ordem
  const moveInOrder = useCallback((fromIndex: number, toIndex: number) => {
    const newOrder = [...content.order]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)
    onChange({ ...content, order: newOrder })
  }, [content, onChange])

  // Atualiza repetições de um item
  const updateRepetitions = useCallback((index: number, delta: number) => {
    const newOrder = content.order.map((item, i) => {
      if (i === index) {
        const newReps = Math.max(1, (item.repetitions || 1) + delta)
        return { ...item, repetitions: newReps }
      }
      return item
    })
    onChange({ ...content, order: newOrder })
  }, [content, onChange])

  // Títulos existentes que podem ser repetidos
  const existingTitles = content.sections.map(s => s.title)

  return (
    <div className="flex flex-col gap-4">
      {/* Seções definidas */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-foreground">Seções da letra</h4>
        
        {content.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
            Nenhuma seção criada. Clique em &quot;Adicionar seção&quot; para começar.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {content.sections.map((section) => (
              <div
                key={section.title}
                className="border border-border rounded-lg bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSection(section.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSectionContent(section.title, e.target.value)}
                  placeholder={`Digite o conteúdo de ${section.title}...`}
                  rows={4}
                  className="w-full px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground bg-transparent resize-none focus:outline-none font-mono"
                />
              </div>
            ))}
          </div>
        )}

        {/* Botão adicionar seção */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar seção
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAddMenu && "rotate-180")} />
          </Button>

          {showAddMenu && (
            <div className="absolute top-full left-0 mt-1 z-10 w-64 bg-card border border-border rounded-lg shadow-lg py-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                Nova seção
              </div>
              {PREDEFINED_SECTIONS.map((title) => (
                <button
                  key={title}
                  onClick={() => addSection(title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  {title}
                </button>
              ))}
              
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-primary"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Personalizado...
                </button>
              ) : (
                <div className="px-3 py-2 flex gap-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Nome da seção"
                    className="flex-1 h-8 px-2 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCustomSection()
                      if (e.key === "Escape") {
                        setShowCustomInput(false)
                        setCustomTitle("")
                      }
                    }}
                  />
                  <Button size="sm" className="h-8" onClick={addCustomSection}>
                    Criar
                  </Button>
                </div>
              )}

              {existingTitles.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t border-border mt-1 pt-2">
                    Repetir seção existente
                  </div>
                  {existingTitles.map((title) => (
                    <button
                      key={`repeat-${title}`}
                      onClick={() => addSection(title, true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      {title}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ordem das seções */}
      {content.order.length > 0 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground">Ordem de exibição</h4>
          <p className="text-xs text-muted-foreground">
            Arraste para reordenar. Use os botões +/- para ajustar repetições.
          </p>
          
          <div className="flex flex-col gap-1.5">
            {content.order.map((item, index) => (
              <div
                key={`order-${item.title}-${index}`}
                className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border group"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                <span className="flex-1 text-sm text-foreground truncate">{item.title}</span>
                
                {/* Controle de repetições */}
                <div className="flex items-center gap-1 bg-background rounded border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 rounded-r-none"
                    onClick={() => updateRepetitions(index, -1)}
                    disabled={(item.repetitions || 1) <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center text-xs font-medium text-foreground">
                    {item.repetitions || 1}x
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 rounded-l-none"
                    onClick={() => updateRepetitions(index, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => moveInOrder(index, index - 1)}
                    >
                      <ChevronDown className="w-3 h-3 rotate-180" />
                    </Button>
                  )}
                  {index < content.order.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => moveInOrder(index, index + 1)}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromOrder(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
