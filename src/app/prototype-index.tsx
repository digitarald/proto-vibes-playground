import Link from "next/link";
import prototypes from "@/generated/prototypes-index.json";
import base from "./base.module.css";
import styles from "./prototype-index.module.css";

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
    <main className={`${base.container} ${styles.list}`}>
      <div className={styles.divider}>
        {items.map((proto) => (
          <Link
            key={proto.slug}
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
        ))}
      </div>
    </main>
  );
}
