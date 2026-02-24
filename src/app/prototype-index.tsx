import Link from "next/link";
import prototypes from "@/generated/prototypes-index.json";

interface Prototype {
  slug: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  createdAt: string;
}

export function PrototypeIndex() {
  const items = prototypes as Prototype[];

  return (
    <main className="mx-auto max-w-3xl px-6 py-6">
      <div className="divide-y divide-border">
        {items.map((proto) => (
          <Link
            key={proto.slug}
            href={`/prototypes/${proto.slug}`}
            className="group block py-3 transition-colors hover:bg-hover/50 -mx-3 px-3 rounded-md"
          >
            <div className="flex items-baseline gap-4">
              <h2 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {proto.title}
              </h2>
              <p className="flex-1 truncate text-sm text-muted">
                {proto.description}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted">
              <span>{proto.author}</span>
              <span>·</span>
              <span className="tabular-nums">
                {new Date(proto.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {proto.tags.length > 0 && (
                <>
                  <span>·</span>
                  <span>{proto.tags.join(", ")}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
