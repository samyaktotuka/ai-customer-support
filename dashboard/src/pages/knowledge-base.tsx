import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import type { Entry } from "@/lib/types"
import {
  BookOpen,
  Check,
  Code,
  Eye,
  FileEdit,
  FileText,
  FolderOpen,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react"

export function KnowledgeBasePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")

  const load = useCallback(() => {
    return api<Entry[]>("/knowledge-base")
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedId) ?? null,
    [entries, selectedId]
  )

  const isDirty = useMemo(() => {
    if (!selectedEntry) return false
    return selectedEntry.title !== title || selectedEntry.content !== content
  }, [selectedEntry, title, content])

  const sections = useMemo(
    () => [...new Set(entries.map((entry) => entry.section))],
    [entries]
  )

  function select(entry: Entry) {
    setSelectedId(entry.id)
    setTitle(entry.title)
    setContent(entry.content)
    setSaved(false)
    setViewMode("edit")
  }

  const save = useCallback(async () => {
    if (selectedId === null || saving) return
    setSaving(true)
    try {
      const updated = await api<Entry>(`/knowledge-base/${selectedId}`, {
        method: "PUT",
        body: JSON.stringify({ title, content }),
      })
      setEntries((prev) =>
        prev.map((entry) => (entry.id === updated.id ? updated : entry))
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }, [selectedId, saving, title, content])

  // Keyboard shortcut Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        if (selectedId !== null && isDirty) {
          e.preventDefault()
          save()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedId, isDirty, save])

  // Filter entries by search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase().trim()
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.section.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q)
    )
  }, [entries, searchQuery])

  // Sections present in filtered results
  const filteredSections = useMemo(
    () => [...new Set(filteredEntries.map((e) => e.section))],
    [filteredEntries]
  )

  // Word and character count
  const wordCount = useMemo(() => {
    const trimmed = content.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [content])

  const charCount = content.length

  // Render basic markdown preview
  const renderMarkdownPreview = (text: string) => {
    const lines = text.split("\n")
    return (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-foreground/90">
        {lines.map((line, idx) => {
          if (line.startsWith("# ")) {
            return (
              <h1
                key={idx}
                className="border-b pt-2 pb-2 text-xl font-bold tracking-tight text-foreground"
              >
                {line.slice(2)}
              </h1>
            )
          }
          if (line.startsWith("## ")) {
            return (
              <h2
                key={idx}
                className="border-b pt-2 pb-1.5 text-lg font-semibold tracking-tight text-foreground"
              >
                {line.slice(3)}
              </h2>
            )
          }
          if (line.startsWith("### ")) {
            return (
              <h3
                key={idx}
                className="pt-1.5 text-base font-semibold text-foreground"
              >
                {line.slice(4)}
              </h3>
            )
          }
          if (line.startsWith("> ")) {
            return (
              <blockquote
                key={idx}
                className="rounded-r-md border-l-4 border-primary/50 bg-primary/5 p-3 text-xs text-muted-foreground italic sm:text-sm"
              >
                {line.slice(2)}
              </blockquote>
            )
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li key={idx} className="ml-5 list-disc text-sm">
                {renderInlineFormatting(line.slice(2))}
              </li>
            )
          }
          if (line.trim() === "---") {
            return <hr key={idx} className="my-4 border-border" />
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />
          }
          return (
            <p key={idx} className="text-sm">
              {renderInlineFormatting(line)}
            </p>
          )
        })}
      </div>
    )
  }

  // Simple inline bold and code tag formatter
  const renderInlineFormatting = (line: string) => {
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Total Knowledge Articles
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{entries.length}</span>
            <span className="text-xs text-muted-foreground">
              indexed documents
            </span>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Knowledge Sections
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FolderOpen className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {sections.length}
            </span>
            <span className="text-xs text-muted-foreground">
              thematic categories
            </span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              AI Retrieval Engine
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Used by AI to formulate accurate customer responses
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={load}
              disabled={loading}
              className="cursor-pointer gap-1 text-xs"
            >
              <RefreshCw
                className={`size-3 ${loading ? "animate-spin" : ""}`}
              />
              Sync
            </Button>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Split: Articles Sidebar & Document Editor */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Sections & Articles Navigator (4 cols on lg) */}
        <Card className="flex flex-col overflow-hidden border-border/70 lg:col-span-4">
          <CardHeader className="border-b border-border/60 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Articles Directory
              </CardTitle>
              <span className="font-mono text-xs text-muted-foreground">
                {filteredEntries.length} items
              </span>
            </div>

            {/* Live Search */}
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles by title or keyword..."
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
          </CardHeader>

          <CardContent className="p-0">
            <nav className="max-h-[640px] space-y-4 overflow-y-auto p-3">
              {loading && entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                  <RefreshCw className="size-5 animate-spin text-primary" />
                  <span className="text-xs">Loading knowledge base...</span>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                  <FileText className="size-6 text-muted-foreground/60" />
                  <p className="text-xs font-medium">
                    No articles match your search
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setSearchQuery("")}
                      className="mt-1 cursor-pointer text-xs"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                filteredSections.map((section) => {
                  const sectionArticles = filteredEntries.filter(
                    (entry) => entry.section === section
                  )
                  return (
                    <div key={section} className="space-y-1">
                      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        <span className="flex items-center gap-1.5">
                          <FolderOpen className="size-3 text-primary/70" />
                          {section}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/80">
                          {sectionArticles.length}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {sectionArticles.map((entry) => {
                          const isSelected = entry.id === selectedId
                          return (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => select(entry)}
                              className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all ${
                                isSelected
                                  ? "bg-primary font-medium text-primary-foreground shadow-2xs"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="flex-1 truncate pr-2">
                                {entry.title}
                              </span>
                              <span
                                className={`shrink-0 font-mono text-[10px] ${
                                  isSelected
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                }`}
                              >
                                #{entry.id}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </nav>
          </CardContent>
        </Card>

        {/* Right Column: Article Editor & Preview (8 cols on lg) */}
        <div className="lg:col-span-8">
          {selectedId === null ? (
            <Card className="flex min-h-[460px] flex-col items-center justify-center border-2 border-dashed border-border/70 bg-muted/10 p-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <BookOpen className="size-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No Article Selected
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Select an article from the directory on the left to read its
                contents, edit company policies, or preview how the customer
                support AI interprets company documentation.
              </p>
            </Card>
          ) : (
            <Card className="flex flex-col overflow-hidden border-border/70 shadow-sm">
              {/* Header with Title Input, Section Tag, Word Count & Mode Toggle */}
              <CardHeader className="border-b border-border/60 bg-muted/20 p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="purple"
                        className="text-xs font-medium uppercase"
                      >
                        <Tag className="mr-1 size-2.5" />
                        {selectedEntry?.section}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        Document #{selectedId}
                      </span>
                      {isDirty && (
                        <Badge variant="warning" className="text-[11px]">
                          Unsaved changes
                        </Badge>
                      )}
                    </div>

                    {/* Mode Toggle: Edit vs Preview */}
                    <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted p-1">
                      <Button
                        variant={viewMode === "edit" ? "default" : "ghost"}
                        size="xs"
                        onClick={() => setViewMode("edit")}
                        className="h-6 cursor-pointer gap-1.5 px-2 text-xs"
                      >
                        <FileEdit className="size-3" />
                        Edit
                      </Button>
                      <Button
                        variant={viewMode === "preview" ? "default" : "ghost"}
                        size="xs"
                        onClick={() => setViewMode("preview")}
                        className="h-6 cursor-pointer gap-1.5 px-2 text-xs"
                      >
                        <Eye className="size-3" />
                        Preview
                      </Button>
                    </div>
                  </div>

                  {/* Article Title Input */}
                  <div className="space-y-1">
                    <label
                      htmlFor="article-title"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Article Title
                    </label>
                    <Input
                      id="article-title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        setSaved(false)
                      }}
                      placeholder="Article title..."
                      className="h-10 border-border/80 text-base font-semibold sm:text-lg"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
                {viewMode === "edit" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Code className="size-3 text-muted-foreground" />
                        Markdown / Plain Text
                      </span>
                      <span>
                        {wordCount} words · {charCount} characters
                      </span>
                    </div>

                    <Textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value)
                        setSaved(false)
                      }}
                      placeholder="Write knowledge base article content in markdown format..."
                      className="min-h-[380px] resize-y border-border/80 bg-background p-4 font-mono text-xs leading-relaxed sm:text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Formatted Article Preview
                      </span>
                      <span>
                        {wordCount} words · {charCount} characters
                      </span>
                    </div>
                    <div className="min-h-[380px] overflow-y-auto rounded-lg border border-border/80 bg-background p-5">
                      {content.trim() ? (
                        renderMarkdownPreview(content)
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No content written for this article.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-3 sm:flex-row">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      Ctrl+S
                    </kbd>
                    <span>Quick save shortcut</span>
                  </div>

                  <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                    {saved && (
                      <span className="flex animate-in items-center gap-1 text-xs font-medium text-emerald-600 fade-in dark:text-emerald-400">
                        <Check className="size-3.5" />
                        Saved successfully
                      </span>
                    )}
                    <Button
                      onClick={save}
                      disabled={saving || !isDirty}
                      size="sm"
                      className="w-full cursor-pointer gap-2 font-medium sm:w-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
