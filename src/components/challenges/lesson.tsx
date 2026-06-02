'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-7 font-display text-xl font-bold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{children}</h3>
  ),
  p: ({ children }) => <p className="leading-relaxed text-foreground/85">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} className="text-accent underline underline-offset-2 hover:no-underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 text-foreground/85">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5 text-foreground/85">{children}</ol>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-md border border-border bg-background p-4 font-mono text-sm leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
        {children}
      </code>
    ),
}

export function Lesson({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
