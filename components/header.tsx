"use client"

import { Music2, Bell, User, Menu, X, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Músicas", href: "/?filter=musicas" },
  { label: "Artistas", href: "/?filter=artistas" },
  { label: "Repertórios", href: "/?filter=repertorios" },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Music2 className="w-4 h-4 text-primary-foreground" />
            </span>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Ciph<span className="text-primary">ersonal</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/novo" className="hidden md:inline-flex">
              <Button size="sm" variant="outline" className="gap-1.5 text-foreground border-border">
                <PlusCircle className="w-4 h-4" />
                Adicionar
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="sr-only">Notificações</span>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
              <User className="w-5 h-5" />
              <span className="sr-only">Perfil</span>
            </Button>
            <Button size="sm" className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
              Entrar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-card border-t border-border",
          menuOpen ? "max-h-72" : "max-h-0"
        )}
      >
        <nav className="px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/novo" onClick={() => setMenuOpen(false)}>
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </div>
          </Link>
          <div className="pt-2 pb-1 border-t border-border mt-1 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-foreground border-border">
              Criar conta
            </Button>
            <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Entrar
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
