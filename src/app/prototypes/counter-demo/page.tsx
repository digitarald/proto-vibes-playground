"use client";

import { useState } from "react";

export default function CounterDemoPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground-bright">
        Counter Demo
      </h1>
      <p className="max-w-md text-muted">
        A trivial client component to prove interactivity works inside the
        prototype sandbox.
      </p>

      <div className="flex items-center gap-6">
        <button
          onClick={() => setCount((c) => c - 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-xl font-medium text-foreground shadow-sm transition-all hover:border-accent/30 hover:shadow-md active:scale-95 focus-visible:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:outline-none"
        >
          −
        </button>
        <span className="min-w-16 font-mono text-5xl font-bold tabular-nums text-foreground-bright">
          {count}
        </span>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-xl font-medium text-foreground shadow-sm transition-all hover:border-accent/30 hover:shadow-md active:scale-95 focus-visible:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:outline-none"
        >
          +
        </button>
      </div>

      <button
        onClick={() => setCount(0)}
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}
