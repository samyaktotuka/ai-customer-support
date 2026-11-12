import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { isLoggedIn, logout } from "@/lib/api"
import { EventsPage } from "@/pages/events"
import { KnowledgeBasePage } from "@/pages/knowledge-base"
import { LoginPage } from "@/pages/login"
import { TicketsPage } from "@/pages/tickets"
import {
  Activity,
  BookOpen,
  LogOut,
  Ticket as TicketIcon,
  TreePine,
} from "lucide-react"

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())
  const [activeTab, setActiveTab] = useState("events")

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  function logOut() {
    logout()
    setLoggedIn(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <TreePine className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight sm:text-lg">
                  Harbor &amp; Pine
                </span>
                <span className="hidden items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 sm:inline-flex dark:text-emerald-400">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live System
                </span>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block">
                AI Customer Support Agent Hub
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center rounded-md border border-border/50 bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground md:flex">
              <kbd className="mr-1.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
                D
              </kbd>
              Toggle theme
            </div>
            <ThemeToggle />
            <div className="mx-1 hidden h-5 w-px bg-border/80 sm:block" />
            <Button
              variant="outline"
              size="sm"
              onClick={logOut}
              className="cursor-pointer gap-1.5 text-xs font-medium transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Navigation Bar */}
          <div className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="flex h-auto flex-wrap rounded-xl border border-border/50 bg-muted/70 p-1 sm:inline-flex">
              <TabsTrigger
                value="events"
                className="gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all sm:text-sm data-active:shadow-sm"
              >
                <Activity className="size-4" />
                <span>Events</span>
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all sm:text-sm data-active:shadow-sm"
              >
                <TicketIcon className="size-4" />
                <span>Tickets</span>
              </TabsTrigger>
              <TabsTrigger
                value="knowledge-base"
                className="gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all sm:text-sm data-active:shadow-sm"
              >
                <BookOpen className="size-4" />
                <span>Knowledge Base</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-1.5 self-end text-xs text-muted-foreground sm:self-center">
              <span>Automated pipeline active</span>
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          <TabsContent
            value="events"
            className="mt-0 focus-visible:outline-none"
          >
            <EventsPage />
          </TabsContent>
          <TabsContent
            value="tickets"
            className="mt-0 focus-visible:outline-none"
          >
            <TicketsPage />
          </TabsContent>
          <TabsContent
            value="knowledge-base"
            className="mt-0 focus-visible:outline-none"
          >
            <KnowledgeBasePage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
