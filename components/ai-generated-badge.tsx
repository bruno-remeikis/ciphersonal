"use client"

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Page } from "@/lib/data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type AIGeneratedBadgeProps = {
  page: Page
  className?: string
}

/**
 * Exibe um badge indicando que a página foi gerada por IA.
 * A marcação só é exibida se:
 * - aiGenerated === true
 * - E a data de edição seja igual à de criação OU seja nula/undefined
 */
export function AIGeneratedBadge({ page, className }: AIGeneratedBadgeProps) {
  // Verifica se deve exibir o badge
  const shouldShowBadge = page.aiGenerated && (
    !page.updatedAt || 
    !page.createdAt ||
    page.updatedAt.toString() === page.createdAt.toString()
  )

  if (!shouldShowBadge) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
              "bg-violet-100 dark:bg-violet-950/50",
              "text-violet-700 dark:text-violet-300",
              "text-[10px] font-medium",
              "border border-violet-200 dark:border-violet-800",
              className
            )}
          >
            <Sparkles className="w-3 h-3" />
            <span>IA</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Gerado por inteligência artificial</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
