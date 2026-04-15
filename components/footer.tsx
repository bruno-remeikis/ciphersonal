import { Music2 } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
            <Music2 className="w-3.5 h-3.5 text-primary-foreground" />
          </span>
          <span className="text-sm font-bold text-foreground">
            Ciph<span className="text-primary">ersonal</span>
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1" aria-label="Links do rodapé">
          {["Sobre", "Contato", "Termos de uso", "Privacidade", "Ajuda"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Ciphersonal. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
