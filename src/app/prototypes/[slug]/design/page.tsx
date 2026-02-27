import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./design.module.css";

interface DesignPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { readdirSync } = await import("fs");
  const prototypesDir = join(process.cwd(), "src/app/prototypes");
  return readdirSync(prototypesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => existsSync(join(prototypesDir, d.name, "DESIGN.md")))
    .map((d) => ({ slug: d.name }));
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { slug } = await params;
  const filePath = join(
    process.cwd(),
    "src/app/prototypes",
    slug,
    "DESIGN.md"
  );

  if (!existsSync(filePath)) notFound();

  const markdown = readFileSync(filePath, "utf-8");

  return (
    <article className={styles.prose}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
