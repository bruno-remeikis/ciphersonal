"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Settings, Eye, Type, Lock, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/components/settings-provider"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { toast } from "sonner"

export function SettingsPageClient() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { settings, updateSettings, isLoading: settingsLoading } = useSettings()
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/login")
    return null
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter no mínimo 6 caracteres")
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPasswordError(data.error || "Erro ao alterar senha")
        return
      }

      toast.success("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setPasswordError("Erro de conexão")
    } finally {
      setPasswordLoading(false)
    }
  }

  const isLoading = authLoading || settingsLoading

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Back button */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Display settings */}
            <section className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Exibição</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Show repertoires in song card */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor="show-repertoires" className="text-sm font-medium text-foreground">
                      Exibir repertórios no card de música
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mostra os repertórios associados em cada card de música
                    </p>
                  </div>
                  <Switch
                    id="show-repertoires"
                    checked={settings.showRepertoiresInSongCard}
                    onCheckedChange={(checked) => updateSettings({ showRepertoiresInSongCard: checked })}
                  />
                </div>
              </div>
            </section>

            {/* Font size settings */}
            <section className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Tipografia</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Sheet font size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="font-size" className="text-sm font-medium text-foreground">
                      Tamanho da fonte nas folhas
                    </Label>
                    <span className="text-sm font-mono text-muted-foreground">
                      {settings.sheetFontSize}px
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Ajuste o tamanho da fonte usada nas cifras e letras
                  </p>
                  <Slider
                    id="font-size"
                    value={[settings.sheetFontSize]}
                    onValueChange={(value) => updateSettings({ sheetFontSize: value[0] })}
                    min={10}
                    max={28}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">10px</span>
                    <span className="text-xs text-muted-foreground">28px</span>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Pré-visualização:</p>
                    <pre 
                      className="font-mono text-foreground whitespace-pre-wrap"
                      style={{ fontSize: `${settings.sheetFontSize}px` }}
                    >
{`Am              G
Exemplo de cifra
      F           C
Com acordes e letra`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Password settings */}
            <section className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Segurança</h2>
              </div>

              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="current-password" className="text-sm font-medium text-foreground">
                    Senha atual
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                    Nova senha
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                    Confirmar nova senha
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="mt-1.5"
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full sm:w-auto self-end gap-2"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Alterar senha
                </Button>
              </form>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
