import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prototypesDir = join(__dirname, "../src/app/prototypes");
const outputDir = join(__dirname, "../src/generated");
const outputFile = join(outputDir, "prototypes-index.json");

if (!existsSync(prototypesDir)) {
  console.log("No prototypes directory found, creating empty index.");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputFile, JSON.stringify([], null, 2));
  process.exit(0);
}

const VARIANT_RE = /^(.+)-v(\d+)-(.+)$/;

const entries = readdirSync(prototypesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const metaPath = join(prototypesDir, d.name, "meta.json");
    if (!existsSync(metaPath)) return null;
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    const hasDesign = existsSync(join(prototypesDir, d.name, "DESIGN.md"));
    const variantMatch = d.name.match(VARIANT_RE);
    const variant = variantMatch
      ? { parentSlug: variantMatch[1], version: parseInt(variantMatch[2], 10), descriptor: variantMatch[3] }
      : null;
    return { slug: d.name, ...meta, hasDesign, variant };
  })
  .filter(Boolean)
  .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, JSON.stringify(entries, null, 2));
console.log(`Generated index with ${entries.length} prototype(s).`);

// Auto-generate per-prototype layout.tsx for OG metadata
const layoutTemplate = `import { prototypeMetadata } from "../prototype-metadata";
import meta from "./meta.json";

export const metadata = prototypeMetadata(meta);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;

let layoutCount = 0;
for (const entry of entries) {
  const layoutPath = join(prototypesDir, entry.slug, "layout.tsx");
  if (!existsSync(layoutPath)) {
    writeFileSync(layoutPath, layoutTemplate);
    layoutCount++;
  }
}
if (layoutCount > 0) {
  console.log(`Generated ${layoutCount} prototype layout(s) for OG metadata.`);
}
