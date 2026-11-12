import { useCallback, useEffect, useMemo, useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import {
  formatDate,
  formatRelativeTime,
  type Message,
  type Ticket,
} from "@/lib/types"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Ticket as TicketIcon,
  TreePine,
  User,
  X,
} from "lucide-react"

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedMsgId, setCopiedMsgId] = useState<number | null>(null)

  const loadTickets = useCallback(() => {
    return api<Ticket[]>("/tickets")
      .then((data) => {
        setTickets(data)
        setSelected((prev) =>
          prev ? (data.find((t) => t.id === prev.id) ?? prev) : null
        )
      })
      .finally(() => setLoadingTickets(false))
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  async function open(ticket: Ticket) {
    setSelected(ticket)
    setLoadingMessages(true)
    try {
      const msgs = await api<Message[]>(`/tickets/${ticket.id}/messages`)
      setMessages(msgs)
    } finally {
      setLoadingMessages(false)
    }
  }

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } catch {
      // fallback
    }
  }

  const copyMessageText = async (body: string, id: number) => {
    try {
      await navigator.clipboard.writeText(body)
      setCopiedMsgId(id)
      setTimeout(() => setCopiedMsgId(null), 2000)
    } catch {
      // fallback
    }
  }

  // Helper for customer avatar initials
  const getInitials = (email: string) => {
    if (!email) return "C"
    const namePart = email.split("@")[0].replace(/[^a-zA-Z]/g, "")
    if (!namePart) return email.slice(0, 2).toUpperCase()
    return namePart.slice(0, 2).toUpperCase()
  }

  // Calculated metrics
  const totalCount = tickets.length
  const escalatedCount = tickets.filter(
    (t) => t.status.toLowerCase() === "escalated"
  ).length
  const openCount = tickets.filter(
    (t) => t.status.toLowerCase() === "open" || t.status.toLowerCase() === "new"
  ).length
  const resolvedCount = tickets.filter((t) =>
    ["resolved", "closed", "done"].includes(t.status.toLowerCase())
  ).length

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Status filter
      if (
        statusFilter === "escalated" &&
        ticket.status.toLowerCase() !== "escalated"
      ) {
        return false
      }
      if (
        statusFilter === "open" &&
        !["open", "new", "in_progress", "pending"].includes(
          ticket.status.toLowerCase()
        )
      ) {
        return false
      }
      if (
        statusFilter === "resolved" &&
        !["resolved", "closed", "done"].includes(ticket.status.toLowerCase())
      ) {
        return false
      }

      // Search query
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const matchSubject = ticket.subject?.toLowerCase().includes(q)
      const matchEmail = ticket.customer_email?.toLowerCase().includes(q)
      const matchCat = ticket.category?.toLowerCase().includes(q)
      const matchId = String(ticket.id).includes(q)
      const matchStatus = ticket.status?.toLowerCase().includes(q)
      return matchSubject || matchEmail || matchCat || matchId || matchStatus
    })
  }, [tickets, statusFilter, searchQuery])

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Total Support Tickets
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TicketIcon className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalCount}</span>
            <span className="text-xs text-muted-foreground">managed cases</span>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Escalated / Needs Review
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                escalatedCount > 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {escalatedCount}
            </span>
            <span className="text-xs text-muted-foreground">
              human intervention
            </span>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Open / In Progress
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {openCount}
            </span>
            <span className="text-xs text-muted-foreground">
              active workflows
            </span>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Resolved Cases
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {resolvedCount}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalCount > 0
                ? `${Math.round((resolvedCount / totalCount) * 100)}%`
                : "0%"}{" "}
              rate
            </span>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Split: Tickets List & Conversation Viewer */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Tickets List (5 cols on lg) */}
        <Card className="flex flex-col overflow-hidden border-border/70 lg:col-span-5">
          <CardHeader className="border-b border-border/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">
                  Tickets Queue
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a ticket to inspect messages and AI actions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={loadTickets}
                disabled={loadingTickets}
                title="Refresh ticket list"
                aria-label="Refresh ticket list"
                className="cursor-pointer"
              >
                <RefreshCw
                  className={`size-3.5 ${loadingTickets ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subject, customer, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter("all")}
                className="cursor-pointer text-xs"
              >
                All ({totalCount})
              </Button>
              <Button
                variant={statusFilter === "escalated" ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter("escalated")}
                className="cursor-pointer text-xs"
              >
                Escalated ({escalatedCount})
              </Button>
              <Button
                variant={statusFilter === "open" ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter("open")}
                className="cursor-pointer text-xs"
              >
                Open ({openCount})
              </Button>
              <Button
                variant={statusFilter === "resolved" ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter("resolved")}
                className="cursor-pointer text-xs"
              >
                Resolved ({resolvedCount})
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-[640px] divide-y divide-border/60 overflow-y-auto">
              {loadingTickets && tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                  <RefreshCw className="size-5 animate-spin text-primary" />
                  <span className="text-xs">Loading tickets...</span>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                  <TicketIcon className="size-7 text-muted-foreground/60" />
                  <p className="text-sm font-medium">No tickets found</p>
                  <p className="text-xs">
                    {searchQuery || statusFilter !== "all"
                      ? "Try clearing your search query or status filter."
                      : "No customer tickets created yet."}
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                      }}
                      className="mt-1 cursor-pointer"
                    >
                      Reset filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selected?.id === ticket.id
                  const isEscalated =
                    ticket.status.toLowerCase() === "escalated"

                  return (
                    <div
                      key={ticket.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => open(ticket)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          open(ticket)
                        }
                      }}
                      className={`group relative cursor-pointer p-3.5 text-left transition-all select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                        isSelected
                          ? "border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10"
                          : "border-l-4 border-l-transparent hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] font-semibold text-muted-foreground">
                            {getInitials(ticket.customer_email)}
                          </div>
                          <span
                            className="truncate text-xs text-muted-foreground"
                            title={ticket.customer_email}
                          >
                            {ticket.customer_email}
                          </span>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>

                      <div className="mt-2">
                        <h3
                          className={`line-clamp-2 text-sm leading-snug ${
                            isSelected
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/90"
                          } ${isEscalated ? "text-destructive dark:text-rose-400" : ""}`}
                        >
                          {ticket.subject || "(No subject)"}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {ticket.category ? (
                            <span className="inline-flex items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5 text-[11px] font-medium text-foreground/80">
                              <Tag className="size-2.5" />
                              {ticket.category}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/60">
                              Uncategorized
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-muted-foreground">
                            #{ticket.id}
                          </span>
                        </div>
                        <span
                          className="text-[11px]"
                          title={`Updated ${formatDate(ticket.updated_at)}`}
                        >
                          {formatRelativeTime(ticket.updated_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Conversation Viewer (7 cols on lg) */}
        <div className="lg:col-span-7">
          {selected ? (
            <Card className="overflow-hidden border-border/70 shadow-sm">
              {/* Ticket Details Header */}
              <CardHeader className="border-b border-border/60 bg-muted/20 p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          Ticket #{selected.id}
                        </span>
                        <StatusBadge status={selected.status} />
                        {selected.category && (
                          <Badge variant="outline" className="text-xs">
                            <Tag className="mr-1 size-2.5" />
                            {selected.category}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg leading-snug font-bold tracking-tight text-foreground">
                        {selected.subject || "(No subject)"}
                      </h2>
                    </div>
                  </div>

                  {/* Customer Meta Row */}
                  <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                        {getInitials(selected.customer_email)}
                      </div>
                      <span className="font-medium text-foreground">
                        {selected.customer_email}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyEmail(selected.customer_email)}
                        className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
                        title="Copy customer email"
                        aria-label="Copy customer email"
                      >
                        {copiedEmail ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3" />
                      <span>
                        Updated {formatRelativeTime(selected.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-5 p-4 sm:p-5">
                {/* Proposed Action Banner */}
                {selected.proposed_action && (
                  <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4 dark:bg-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                        <Sparkles className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                            AI Proposed Action
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed font-medium text-foreground/90">
                          {selected.proposed_action}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversation Thread */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      <MessageSquare className="size-3.5" />
                      Message History ({messages.length})
                    </span>
                    {loadingMessages && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <RefreshCw className="size-3 animate-spin" />
                        Syncing...
                      </span>
                    )}
                  </div>

                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                      <RefreshCw className="size-6 animate-spin text-primary" />
                      <span className="text-xs">
                        Loading message conversation...
                      </span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Mail className="mx-auto mb-2 size-8 text-muted-foreground/60" />
                      <p className="text-sm font-medium">
                        No messages recorded for this ticket.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {messages.map((message) => {
                        const isOutbound = message.direction === "out"
                        const isCopied = copiedMsgId === message.id

                        return (
                          <div
                            key={message.id}
                            className={`flex flex-col ${
                              isOutbound ? "items-end" : "items-start"
                            }`}
                          >
                            {/* Message Header Meta */}
                            <div
                              className={`mb-1 flex items-center gap-1.5 px-1 text-xs text-muted-foreground ${
                                isOutbound ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <div
                                className={`flex size-5 items-center justify-center rounded-full ${
                                  isOutbound
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                } text-[10px]`}
                              >
                                {isOutbound ? (
                                  <TreePine className="size-3" />
                                ) : (
                                  <User className="size-3" />
                                )}
                              </div>
                              <span className="font-medium text-foreground">
                                {isOutbound
                                  ? "Support Agent (Automated)"
                                  : message.from_address}
                              </span>
                              <span>·</span>
                              <span title={formatDate(message.created_at)}>
                                {formatRelativeTime(message.created_at)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyMessageText(message.body, message.id)
                                }
                                className="cursor-pointer p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                                title="Copy message text"
                                aria-label="Copy message text"
                              >
                                {isCopied ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>

                            {/* Message Bubble */}
                            <div
                              className={`group relative max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                                isOutbound
                                  ? "rounded-tr-xs bg-primary text-primary-foreground"
                                  : "rounded-tl-xs border border-border/80 bg-muted/70 text-foreground"
                              }`}
                            >
                              <div className="text-sm leading-relaxed font-normal break-words whitespace-pre-wrap">
                                {message.body}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex min-h-[380px] flex-col items-center justify-center border-2 border-dashed border-border/70 bg-muted/10 p-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <TicketIcon className="size-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No Ticket Selected
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Select any customer ticket from the queue on the left to read
                its full message thread, review AI-generated recommendations,
                and verify resolution status.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
                <span>Browse queue</span>
                <ArrowRight className="size-3.5" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
