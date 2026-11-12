export type SupportEvent = {
  id: number
  gmail_message_id: string
  status: string
  attempts: number
  error: string | null
  created_at: string
}

export type Ticket = {
  id: number
  subject: string
  customer_email: string
  category: string | null
  status: string
  proposed_action: string | null
  updated_at: string
}

export type Message = {
  id: number
  direction: "in" | "out"
  from_address: string
  body: string
  created_at: string
}

export type Entry = {
  id: number
  section: string
  title: string
  content: string
}

export function formatDate(value: string) {
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    return d.toLocaleString()
  } catch {
    return value
  }
}

export function formatRelativeTime(value: string): string {
  try {
    const date = new Date(value)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    if (isNaN(diffMs)) return value

    const diffSecs = Math.floor(diffMs / 1000)
    if (diffSecs < 45) return "Just now"
    const diffMins = Math.floor(diffSecs / 60)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  } catch {
    return value
  }
}
