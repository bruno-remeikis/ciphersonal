"use client"

import { useState, useCallback, useRef } from "react"
import { Plus, Trash2, GripVertical, ChevronDown, Copy, Minus, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Lyrics2Content, Lyrics2Section, Lyrics2OrderItem } from "@/lib/data"
import { SECTION_COLORS, getSectionColorById, SectionColorId } from "@/lib/data"

// Opções pré-definidas de seção
const PREDEFINED_SECTIONS = ["Verso", "Refrão", "Pré-Refrão", "Ponte", "Intro", "Outro"]

// Cores padrão atribuídas por tipo de seção
const DEFAULT_SECTION_COLORS: Record<string, SectionColorId> = {
  "Verso": "blue",
  "Refrão": "amber",
  "Pré-Refrão": "purple",
  "Ponte": "emerald",
  "Intro": "rose",
  "Outro": "slate",
}

type Lyrics2EditorProps = {
  content: Lyrics2Content
  onChange: (content: Lyrics2Content) => void
}

export function Lyrics2Editor({ content, onChange }: Lyrics2EditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingSectionContent, setEditingSectionContent] = useState("")
  const [selectedColorForNew, setSelectedColorForNew] = useState<SectionColorId>("blue")
  
  // Drag and drop state
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  // Encontra o título base (sem número)
  const getBaseTitle = (title: string) => title.replace(/\s*\d+$/, "").trim()

  // Conta quantas seções existem com um título base
  const countSectionsWithBase = useCallback((baseTitle: string) => {
    return content.sections.filter(s => getBaseTitle(s.title) === baseTitle).length
  }, [content.sections])

  // Renumera seções com o mesmo título base
  const renumberSectionsWithBase = useCallback((sections: Lyrics2Section[], baseTitle: string): Lyrics2Section[] => {
    const matching = sections.filter(s => getBaseTitle(s.title) === baseTitle)
    const others = sections.filter(s => getBaseTitle(s.title) !== baseTitle)
    
    if (matching.length === 0) return sections
    if (matching.length === 1) {
      // Se só tem uma, remove o número
      return [...others, { ...matching[0], title: baseTitle }]
    }
    
    // Se tem mais de uma, numera todas
    const renumbered = matching.map((s, i) => ({
      ...s,
      title: `${baseTitle} ${i + 1}`
    }))
    
    return [...others, ...renumbered]
  }, [])

  // Obtém a cor para uma seção baseada no título base
  const getDefaultColorForSection = useCallback((baseTitle: string): SectionColorId => {
    // Verifica se existe uma seção com esse título base
    const existing = content.sections.find(s => getBaseTitle(s.title) === baseTitle)
    if (existing?.colorId) return existing.colorId
    
    // Usa cor padrão por tipo
    if (DEFAULT_SECTION_COLORS[baseTitle]) return DEFAULT_SECTION_COLORS[baseTitle]
    
    // Atribui uma cor baseada no número de seções únicas
    const uniqueBases = new Set(content.sections.map(s => getBaseTitle(s.title)))
    const colorIndex = uniqueBases.size % SECTION_COLORS.length
    return SECTION_COLORS[colorIndex].id
  }, [content.sections])

  // Adiciona nova seção
  const addSection = useCallback((baseTitle: string, isRepeat: boolean = false, colorId?: SectionColorId) => {
    if (isRepeat) {
      // Verifica se a última seção na ordem é a mesma
      const lastOrderItem = content.order[content.order.length - 1]
      const lastBaseTitle = lastOrderItem ? getBaseTitle(lastOrderItem.title) : ""
      
      // Encontra o título correto para repetir
      const sectionToRepeat = content.sections.find(s => getBaseTitle(s.title) === baseTitle)
      if (!sectionToRepeat) return
      
      if (lastBaseTitle === baseTitle) {
        // Incrementa as repetições da última seção
        const newOrder = content.order.map((item, index) => 
          index === content.order.length - 1 
            ? { ...item, repetitions: (item.repetitions || 1) + 1 }
            : item
        )
        onChange({ ...content, order: newOrder })
      } else {
        // Adiciona nova entrada na ordem
        const newOrder: Lyrics2OrderItem[] = [...content.order, { 
          title: sectionToRepeat.title, 
          expanded: false, 
          repetitions: 1 
        }]
        onChange({ ...content, order: newOrder })
      }
    } else {
      // Cria nova seção
      const existingCount = countSectionsWithBase(baseTitle)
      const finalColor = colorId || getDefaultColorForSection(baseTitle)
      
      let newSections = [...content.sections]
      let finalTitle = baseTitle
      
      if (existingCount > 0) {
        // Renumera existentes
        newSections = renumberSectionsWithBase(newSections, baseTitle)
        finalTitle = `${baseTitle} ${existingCount + 1}`
      }
      
      newSections.push({ title: finalTitle, content: "", colorId: finalColor })
      
      // Atualiza ordem com títulos renumerados
      let newOrder = content.order.map(item => {
        const itemBase = getBaseTitle(item.title)
        if (itemBase === baseTitle) {
          const matchingSection = newSections.find(s => getBaseTitle(s.title) === itemBase)
          if (matchingSection) {
            return { ...item, title: matchingSection.title }
          }
        }
        return item
      })
      
      // Verifica se a última seção tem o mesmo título base
      const lastOrderItem = newOrder[newOrder.length - 1]
      const lastBaseTitle = lastOrderItem ? getBaseTitle(lastOrderItem.title) : ""
      
      if (lastBaseTitle === baseTitle && lastOrderItem) {
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
  }, [content, onChange, countSectionsWithBase, getDefaultColorForSection, renumberSectionsWithBase])

  // Adiciona seção personalizada
  const addCustomSection = useCallback(() => {
    if (!customTitle.trim()) return
    addSection(customTitle.trim(), false, selectedColorForNew)
  }, [customTitle, addSection, selectedColorForNew])

  // Atualiza conteúdo de uma seção
  const updateSectionContent = useCallback((title: string, newContent: string) => {
    const newSections = content.sections.map(section =>
      section.title === title ? { ...section, content: newContent } : section
    )
    onChange({ ...content, sections: newSections })
  }, [content, onChange])

  // Atualiza cor de uma seção
  const updateSectionColor = useCallback((title: string, colorId: SectionColorId) => {
    const newSections = content.sections.map(section =>
      section.title === title ? { ...section, colorId } : section
    )
    onChange({ ...content, sections: newSections })
  }, [content, onChange])

  // Remove seção
  const removeSection = useCallback((title: string) => {
    const baseTitle = getBaseTitle(title)
    let newSections = content.sections.filter(s => s.title !== title)
    const newOrder = content.order.filter(item => item.title !== title)
    
    // Renumera as seções restantes com o mesmo título base
    newSections = renumberSectionsWithBase(newSections, baseTitle)
    
    // Atualiza ordem com títulos renumerados
    const updatedOrder = newOrder.map(item => {
      const itemBase = getBaseTitle(item.title)
      if (itemBase === baseTitle) {
        const matchingSection = newSections.find(s => getBaseTitle(s.title) === itemBase)
        if (matchingSection) {
          return { ...item, title: matchingSection.title }
        }
      }
      return item
    })
    
    onChange({ sections: newSections, order: updatedOrder })
  }, [content, onChange, renumberSectionsWithBase])

  // Remove item da ordem (mas mantém a seção)
  const removeFromOrder = useCallback((index: number) => {
    const newOrder = content.order.filter((_, i) => i !== index)
    onChange({ ...content, order: newOrder })
  }, [content, onChange])

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null
      dragOverItem.current = null
      return
    }
    
    const newOrder = [...content.order]
    const [removed] = newOrder.splice(dragItem.current, 1)
    newOrder.splice(dragOverItem.current, 0, removed)
    
    onChange({ ...content, order: newOrder })
    
    dragItem.current = null
    dragOverItem.current = null
  }

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

  // Inicia edição de seção
  const startEditingSection = (title: string) => {
    const section = content.sections.find(s => s.title === title)
    if (section) {
      setEditingSection(title)
      setEditingSectionContent(section.content)
    }
  }

  // Salva edição de seção
  const saveEditingSection = () => {
    if (editingSection) {
      updateSectionContent(editingSection, editingSectionContent)
      setEditingSection(null)
      setEditingSectionContent("")
    }
  }

  // Cancela edição de seção
  const cancelEditingSection = () => {
    setEditingSection(null)
    setEditingSectionContent("")
  }

  // Títulos existentes que podem ser repetidos
  const existingTitles = content.sections.map(s => s.title)

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Coluna 1: Seções definidas */}
      <div className="flex-1 flex flex-col gap-3">
        <h4 className="text-sm font-medium text-foreground">Seções da letra</h4>
        
        {content.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
            Nenhuma seção criada. Clique em &quot;Adicionar seção&quot; para começar.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {content.sections.map((section) => {
              const colors = getSectionColorById(section.colorId)
              return (
                <div
                  key={section.title}
                  className="border border-border rounded-lg bg-card overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full", colors.dot)} />
                      <span className="text-sm font-medium text-foreground">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Seletor de cor */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          title="Alterar cor"
                        >
                          <div className={cn("w-4 h-4 rounded-full border border-border", colors.dot)} />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 z-20 hidden group-hover:flex bg-card border border-border rounded-lg shadow-lg p-2 gap-1 flex-wrap w-24">
                          {SECTION_COLORS.map(c => (
                            <button
                              key={c.id}
                              onClick={() => updateSectionColor(section.title, c.id)}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                                c.dot,
                                section.colorId === c.id ? "border-foreground" : "border-transparent"
                              )}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSection(section.title)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSectionContent(section.title, e.target.value)}
                    placeholder={`Digite o conteúdo de ${section.title}...`}
                    rows={4}
                    className="w-full px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground bg-transparent resize-none focus:outline-none font-mono"
                  />
                </div>
              )
            })}
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
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 w-72 bg-card border border-border rounded-lg shadow-lg py-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                  Nova seção
                </div>
                {PREDEFINED_SECTIONS.map((title) => {
                  const colorId = getDefaultColorForSection(title)
                  const colors = getSectionColorById(colorId)
                  return (
                    <button
                      key={title}
                      onClick={() => addSection(title)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                    >
                      <span className={cn("w-3 h-3 rounded-full", colors.dot)} />
                      <span className="lowercase">novo {title.toLowerCase()}</span>
                    </button>
                  )
                })}
                
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Personalizado...
                  </button>
                ) : (
                  <div className="px-3 py-2 flex flex-col gap-2">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Nome da seção"
                      className="w-full h-8 px-2 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCustomSection()
                        if (e.key === "Escape") {
                          setShowCustomInput(false)
                          setCustomTitle("")
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Cor:</span>
                      <div className="flex gap-1">
                        {SECTION_COLORS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedColorForNew(c.id)}
                            className={cn(
                              "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                              c.dot,
                              selectedColorForNew === c.id ? "border-foreground" : "border-transparent"
                            )}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
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
                    {existingTitles.map((title) => {
                      const section = content.sections.find(s => s.title === title)
                      const colors = getSectionColorById(section?.colorId)
                      return (
                        <button
                          key={`repeat-${title}`}
                          onClick={() => addSection(getBaseTitle(title), true)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                        >
                          <span className={cn("w-3 h-3 rounded-full", colors.dot)} />
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          {title}
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Coluna 2: Ordem das seções */}
      {content.order.length > 0 && (
        <div className="flex-1 flex flex-col gap-3 lg:border-l lg:border-border lg:pl-4">
          <h4 className="text-sm font-medium text-foreground">Ordem de exibição</h4>
          <p className="text-xs text-muted-foreground">
            Arraste para reordenar. Use +/- para repetições.
          </p>
          
          <div className="flex flex-col gap-1.5">
            {content.order.map((item, index) => {
              const section = content.sections.find(s => s.title === item.title)
              const colors = getSectionColorById(section?.colorId)
              
              return (
                <div
                  key={`order-${item.title}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border group cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className={cn("w-3 h-3 rounded-full shrink-0", colors.dot)} />
                  <span className="flex-1 text-sm text-foreground truncate">{item.title}</span>
                  
                  {/* Controle de repetições */}
                  <div className="flex items-center gap-0.5 bg-background rounded border border-border">
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
                  
                  {/* Modal de edição inline */}
                  {editingSection === item.title ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-green-600 hover:text-green-700"
                        onClick={saveEditingSection}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-muted-foreground hover:text-foreground"
                        onClick={cancelEditingSection}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-muted-foreground hover:text-foreground"
                        onClick={() => startEditingSection(item.title)}
                        title="Editar conteúdo"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromOrder(index)}
                        title="Remover da ordem"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Modal de edição de seção */}
          {editingSection && (
            <div className="mt-2 border border-border rounded-lg bg-card overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                <span className="text-sm font-medium text-foreground">Editando: {editingSection}</span>
              </div>
              <textarea
                value={editingSectionContent}
                onChange={(e) => setEditingSectionContent(e.target.value)}
                placeholder={`Digite o conteúdo de ${editingSection}...`}
                rows={4}
                className="w-full px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground bg-transparent resize-none focus:outline-none font-mono"
                autoFocus
              />
              <div className="flex justify-end gap-2 px-3 py-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={cancelEditingSection}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={saveEditingSection}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
