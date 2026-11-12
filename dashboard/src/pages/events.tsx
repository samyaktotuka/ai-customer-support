import { useCallback, useEffect, useMemo, useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import { formatDate, formatRelativeTime, type SupportEvent } from "@/lib/types"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Inbox,
  RefreshCw,
  Search,
  X,
} from "lucide-react"

export function EventsPage() {
  const [events, setEvents] = useState<SupportEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeErrorEvent, setActiveErrorEvent] = useState<SupportEvent | null>(
    null
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedError, setCopiedError] = useState(false)

  const load = useCallback(() => {
    return api<SupportEvent[]>("/events")
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function checkInbox() {
    setChecking(true)
    try {
      await api("/poll", { method: "POST" })
      await load()
    } finally {
      setChecking(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
    }
  }

  const copyFullError = async (errorText: string) => {
    try {
      await navigator.clipboard.writeText(errorText)
      setCopiedError(true)
      setTimeout(() => setCopiedError(false), 2000)
    } catch {
      // fallback
    }
  }

  // Calculated metrics
  const totalEvents = events.length
  const failedCount = events.filter(
    (e) => e.status.toLowerCase() === "failed" || Boolean(e.error)
  ).length
  const processedCount = events.filter((e) =>
    ["processed", "resolved", "done", "success"].includes(
      e.status.toLowerCase()
    )
  ).length
  const processingCount = events.filter((e) =>
    ["processing", "in_progress", "pending"].includes(e.status.toLowerCase())
  ).length

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Status filter
      if (statusFilter === "failed") {
        const isFailed =
          event.status.toLowerCase() === "failed" || Boolean(event.error)
        if (!isFailed) return false
      } else if (statusFilter === "processed") {
        const isProcessed = [
          "processed",
          "resolved",
          "done",
          "success",
        ].includes(event.status.toLowerCase())
        if (!isProcessed) return false
      } else if (statusFilter === "processing") {
        const isProcessing = ["processing", "in_progress", "pending"].includes(
          event.status.toLowerCase()
        )
        if (!isProcessing) return false
      }

      // Search filter
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const matchId = String(event.id).includes(q)
      const matchGmail = event.gmail_message_id?.toLowerCase().includes(q)
      const matchStatus = event.status?.toLowerCase().includes(q)
      const matchError = event.error?.toLowerCase().includes(q)
      return matchId || matchGmail || matchStatus || matchError
    })
  }, [events, statusFilter, searchQuery])

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Total Ingested Events
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalEvents}</span>
            <span className="text-xs text-muted-foreground">
              all-time logged
            </span>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Processed Successfully
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {processedCount}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalEvents > 0
                ? `${Math.round((processedCount / totalEvents) * 100)}%`
                : "0%"}{" "}
              rate
            </span>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Failures / Errors
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                failedCount > 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {failedCount}
            </span>
            <span className="text-xs text-muted-foreground">
              requires attention
            </span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Inbox Poller
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Inbox className="size-4" />
            </div>
          </div>
          <div className="mt-2">
            <Button
              onClick={checkInbox}
              disabled={checking}
              size="sm"
              className="w-full cursor-pointer gap-2 font-medium"
            >
              <RefreshCw
                className={`size-3.5 ${checking ? "animate-spin text-primary-foreground" : ""}`}
              />
              {checking ? "Checking inbox..." : "Check inbox now"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/70">
        <CardHeader className="border-b border-border/60 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Support Events Log
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Real-time queue of incoming messages and pipeline execution
                results
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={load}
                disabled={loading}
                className="cursor-pointer gap-1.5 text-xs"
                title="Refresh events list"
              >
                <RefreshCw
                  className={`size-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, Gmail message ID, or error..."
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

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter("all")}
                className="cursor-pointer text-xs"
              >
                All ({totalEvents})
              </Button>
              <Button
                variant={statusFilter === "processed" ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter("processed")}
                className="cursor-pointer text-xs"
              >
                Processed ({processedCount})
              </Button>
              <Button
                variant={statusFilter === "failed" ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter("failed")}
                className="cursor-pointer text-xs"
              >
                Failed ({failedCount})
              </Button>
              {processingCount > 0 && (
                <Button
                  variant={
                    statusFilter === "processing" ? "default" : "outline"
                  }
                  size="xs"
                  onClick={() => setStatusFilter("processing")}
                  className="cursor-pointer text-xs"
                >
                  Processing ({processingCount})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-transparent">
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-48">Gmail Message ID</TableHead>
                <TableHead className="w-24 text-center">Attempts</TableHead>
                <TableHead>Error Details</TableHead>
                <TableHead className="w-36 text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && events.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-36 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-5 animate-spin text-primary" />
                      <span>Loading support events...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-36 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="size-8 text-muted-foreground/60" />
                      <p className="font-medium">No events found</p>
                      <p className="text-xs">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your search query or status filter."
                          : "No support events have been received yet. Click 'Check inbox now' to trigger polling."}
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
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => {
                  const isCopied = copiedId === `msg-${event.id}`
                  return (
                    <TableRow
                      key={event.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                        #{event.id}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={event.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span
                            className="max-w-[140px] truncate text-muted-foreground"
                            title={event.gmail_message_id}
                          >
                            {event.gmail_message_id}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                event.gmail_message_id,
                                `msg-${event.id}`
                              )
                            }
                            className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
                            title="Copy Gmail message ID"
                            aria-label={`Copy Gmail message ID for event ${event.id}`}
                          >
                            {isCopied ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            event.attempts > 1
                              ? "bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {event.attempts}
                        </span>
                      </TableCell>
                      <TableCell>
                        {event.error ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="max-w-xs truncate rounded border border-destructive/20 bg-destructive/10 px-2 py-0.5 font-mono text-xs text-destructive"
                              title={event.error}
                            >
                              {event.error}
                            </span>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setActiveErrorEvent(event)}
                              className="h-6 cursor-pointer px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
                              title="Inspect complete error trace"
                            >
                              <ExternalLink className="mr-1 size-3" />
                              Details
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className="text-xs text-muted-foreground"
                          title={formatDate(event.created_at)}
                        >
                          {formatRelativeTime(event.created_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Details Modal */}
      <Dialog
        open={activeErrorEvent !== null}
        onOpenChange={(open) => !open && setActiveErrorEvent(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <DialogTitle>
                Event #{activeErrorEvent?.id} Error Details
              </DialogTitle>
            </div>
            <DialogDescription>
              Failure occurred while processing Gmail message ID:{" "}
              <span className="font-mono font-medium text-foreground">
                {activeErrorEvent?.gmail_message_id}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Execution Attempts: {activeErrorEvent?.attempts}</span>
              <span>
                Logged:{" "}
                {activeErrorEvent && formatDate(activeErrorEvent.created_at)}
              </span>
            </div>

            <div className="relative rounded-lg border border-border bg-muted/60 p-3">
              <pre className="max-h-60 overflow-x-auto font-mono text-xs whitespace-pre-wrap text-destructive">
                {activeErrorEvent?.error}
              </pre>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                activeErrorEvent?.error && copyFullError(activeErrorEvent.error)
              }
              className="cursor-pointer gap-1.5 text-xs"
            >
              {copiedError ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Copied error to clipboard
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy error trace
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveErrorEvent(null)}
              className="cursor-pointer text-xs"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
