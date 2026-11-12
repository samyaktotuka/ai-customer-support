import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = (status || "").toLowerCase().trim()

  if (norm === "escalated") {
    return (
      <Badge variant="destructive" className={className}>
        <AlertTriangle className="size-3" aria-hidden="true" />
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  if (norm === "failed" || norm === "error") {
    return (
      <Badge variant="destructive" className={className}>
        <AlertCircle className="size-3" aria-hidden="true" />
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  if (
    norm === "processed" ||
    norm === "resolved" ||
    norm === "closed" ||
    norm === "done" ||
    norm === "success"
  ) {
    return (
      <Badge variant="success" className={className}>
        <CheckCircle2 className="size-3" aria-hidden="true" />
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  if (norm === "processing" || norm === "in_progress" || norm === "pending") {
    return (
      <Badge variant="warning" className={className}>
        <Clock
          className="size-3 animate-spin duration-3000"
          aria-hidden="true"
        />
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  if (norm === "open" || norm === "new") {
    return (
      <Badge variant="info" className={className}>
        <span
          className="size-1.5 animate-pulse rounded-full bg-sky-500"
          aria-hidden="true"
        />
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={className}>
      <span
        className="size-1.5 rounded-full bg-muted-foreground"
        aria-hidden="true"
      />
      <span className="capitalize">{status}</span>
    </Badge>
  )
}
