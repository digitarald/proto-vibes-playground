import Link from "next/link";
import prototypes from "@/generated/prototypes-index.json";
import base from "./base.module.css";
import styles from "./prototype-index.module.css";

interface VariantInfo {
  parentSlug: string;
  version: number;
  descriptor: string;
}

interface Prototype {
  slug: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  createdAt: string;
  variant?: VariantInfo | null;
}

function groupPrototypes(items: Prototype[]) {
  const parents: Prototype[] = [];
  const variantMap = new Map<string, Prototype[]>();

  for (const item of items) {
    if (item.variant) {
      const key = item.variant.parentSlug;
      if (!variantMap.has(key)) variantMap.set(key, []);
      variantMap.get(key)!.push(item);
    } else {
      parents.push(item);
    }
  }

  // Sort variants by version within each group
  for (const variants of variantMap.values()) {
    variants.sort((a, b) => (a.variant!.version - b.variant!.version));
  }

  return { parents, variantMap };
}

export function PrototypeIndex() {
  const items = prototypes as Prototype[];
  const { parents, variantMap } = groupPrototypes(items);

  return (
    <main className={`${base.container} ${styles.list}`}>
      <div className={styles.divider}>
        {parents.map((proto) => {
          const variants = variantMap.get(proto.slug);
          return (
            <div key={proto.slug} className={styles.group}>
              <Link
                href={`/prototypes/${proto.slug}`}
                className={styles.item}
              >
                <div className={styles.itemRow}>
                  <h2 className={styles.itemTitle}>{proto.title}</h2>
                  <p className={styles.itemDescription}>{proto.description}</p>
                </div>
                <div className={styles.itemMeta}>
                  <span>{proto.author}</span>
                  <span>·</span>
                  <span className={styles.tabularNums}>
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
              {variants && variants.length > 0 && (
                <div className={styles.variantList}>
                  {variants.map((v) => (
                    <Link
                      key={v.slug}
                      href={`/prototypes/${v.slug}`}
                      className={styles.variantItem}
                    >
                      <span className={styles.versionBadge}>v{v.variant!.version}</span>
                      <span className={styles.variantDescriptor}>{v.variant!.descriptor.replace(/-/g, " ")}</span>
                      <span className={styles.variantSummary}>{v.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
