export default function HelloWorldPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground-bright">
        Hello, World
      </h1>
      <p className="max-w-md text-lg text-muted">
        This is the simplest possible prototype. It exists to prove the scaffold
        works — a static page, discovered automatically, listed on the index.
      </p>
      <div className="mt-4 rounded-xl border border-border bg-card px-6 py-4 font-mono text-sm text-muted">
        src/app/prototypes/hello-world/page.tsx
      </div>
    </div>
  );
}
