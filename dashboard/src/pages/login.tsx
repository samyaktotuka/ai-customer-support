import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { api, logout, saveLogin } from "@/lib/api"
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Sparkles,
  TreePine,
  User,
} from "lucide-react"

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!username.trim() || !password) return

    setError("")
    setIsLoading(true)
    saveLogin(username, password)

    try {
      await api("/login")
      onLogin()
    } catch {
      logout()
      setError("Invalid username or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-background via-muted/30 to-background p-4 sm:p-6">
      {/* Top action bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Decorative ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-4 shadow-primary/20 ring-primary/10">
            <TreePine className="size-7" />
          </div>
          <div className="mt-4 flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground">
            <Sparkles className="size-3 text-primary" />
            <span>AI Customer Support Agent</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Harbor &amp; Pine
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Support operations and automation control center
          </p>
        </div>

        <Card className="border border-border/80 shadow-xl shadow-black/5 backdrop-blur-sm dark:shadow-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the support dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-4">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="flex-1 leading-tight font-medium">
                    {error}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="username" className="text-xs font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    required
                    placeholder="e.g. admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10 pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10 pl-9"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="mt-2 h-10 w-full cursor-pointer font-medium"
                disabled={isLoading || !username.trim() || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 size-4" aria-hidden="true" />
                    Sign in to dashboard
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected system · Access restricted to authorized support staff
        </p>
      </div>
    </div>
  )
}
