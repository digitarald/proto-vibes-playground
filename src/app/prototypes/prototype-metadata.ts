import type { Metadata } from "next";

interface PrototypeMeta {
  title: string;
  description: string;
  [key: string]: unknown;
}

export function prototypeMetadata(meta: PrototypeMeta): Metadata {
  const title = `${meta.title} — Proto Vibes`;
  return {
    title,
    description: meta.description,
    openGraph: {
      title,
      description: meta.description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: meta.description,
    },
  };
}
