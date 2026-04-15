"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Show max 5 pages: first, last, current and 1 neighbor each side
  const visiblePages = pages.filter((p) => {
    if (totalPages <= 5) return true
    if (p === 1 || p === totalPages) return true
    if (Math.abs(p - currentPage) <= 1) return true
    return false
  })

  const withEllipsis: (number | "...")[] = []
  visiblePages.forEach((p, i) => {
    if (i > 0 && p - (visiblePages[i - 1] as number) > 1) {
      withEllipsis.push("...")
    }
    withEllipsis.push(p)
  })

  return (
    <nav
      className={cn("flex items-center justify-center gap-1 pt-4", className)}
      aria-label="Paginação"
    >
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {withEllipsis.map((item, i) =>
        item === "..." ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-muted-foreground select-none">
            &hellip;
          </span>
        ) : (
          <Button
            key={item}
            variant={currentPage === item ? "default" : "outline"}
            size="icon"
            className={cn(
              "w-8 h-8 text-sm",
              currentPage === item && "bg-primary text-primary-foreground border-primary"
            )}
            onClick={() => onPageChange(item as number)}
            aria-label={`Página ${item}`}
            aria-current={currentPage === item ? "page" : undefined}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  )
}
