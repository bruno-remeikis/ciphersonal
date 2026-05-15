"use client"

import { Music2, Bell, User, Menu, X, PlusCircle, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Músicas", href: "/?filter=musicas" },
  { label: "Artistas", href: "/?filter=artistas" },
  { label: "Repertórios", href: "/?filter=repertorios" },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isLoading } = useAuth()

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
            {!isLoading && user ? (
              <>
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
                
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <User className="w-5 h-5" />
                      <span className="sr-only">Menu do usuário</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/configuracoes">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : !isLoading ? (
              <Link href="/login">
                <Button size="sm" className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                  Entrar
                </Button>
              </Link>
            ) : null}
            
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
          menuOpen ? "max-h-96" : "max-h-0"
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
          
          {user && (
            <>
              <Link href="/novo" onClick={() => setMenuOpen(false)}>
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <PlusCircle className="w-4 h-4" />
                  Adicionar
                </div>
              </Link>
              <Link href="/configuracoes" onClick={() => setMenuOpen(false)}>
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <Settings className="w-4 h-4" />
                  Configurações
                </div>
              </Link>
            </>
          )}
          
          <div className="pt-2 pb-1 border-t border-border mt-1">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
