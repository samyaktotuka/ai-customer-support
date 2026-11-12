import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Laptop, Moon, Sun } from "lucide-react"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycleTheme}
      className={className}
      title={`Theme: ${theme} (Click to change, or press 'D')`}
      aria-label={`Current theme is ${theme}. Click to switch theme or press D.`}
    >
      {theme === "light" && (
        <Sun className="size-4 text-amber-500 transition-transform hover:rotate-45" />
      )}
      {theme === "dark" && (
        <Moon className="size-4 text-sky-400 transition-transform hover:-rotate-12" />
      )}
      {theme === "system" && (
        <Laptop className="size-4 text-muted-foreground" />
      )}
    </Button>
  )
}
