import { PrototypeIndex } from "./prototype-index";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-chrome/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-bright">
            Proto Vibes
          </h1>
          <p className="mt-1 text-sm text-muted">
            A playground for rapid UI prototyping — self-contained, disposable, and always live.
          </p>
        </div>
      </header>

      {/* Content */}
      <PrototypeIndex />

      {/* CTA */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <p className="text-lg font-medium text-foreground-bright">
            Build something new
          </p>
          <p className="mt-1.5 text-sm text-muted">
            Ask Copilot to create a prototype — describe what you want and it
            scaffolds everything for you.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2 text-sm text-accent">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 11.41l-.07.07H7.14l-.07-.07V9.55l.07-.07h1.72l.07.07v1.86zm.12-3.36l-.15.07H7.1l-.14-.07-.08-.1L6.44 4.2l.07-.12h3l.06.12L9.13 7.95l-.08.1z" />
            </svg>
            <span className="font-mono text-xs">/new-prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
