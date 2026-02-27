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

const entries = readdirSync(prototypesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const metaPath = join(prototypesDir, d.name, "meta.json");
    if (!existsSync(metaPath)) return null;
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    const hasDesign = existsSync(join(prototypesDir, d.name, "DESIGN.md"));
    return { slug: d.name, ...meta, hasDesign };
  })
  .filter(Boolean)
  .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, JSON.stringify(entries, null, 2));
console.log(`Generated index with ${entries.length} prototype(s).`);
