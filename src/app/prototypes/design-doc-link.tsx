"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import prototypes from "../../generated/prototypes-index.json";
import styles from "./layout.module.css";

export function DesignDocLink() {
  const pathname = usePathname();
  const match = pathname.match(/^\/prototypes\/([^/]+)/);
  if (!match) return null;

  const slug = match[1];
  const isOnDesign = pathname.includes("/design");

  const proto = prototypes.find(
    (p: { slug: string; hasDesign?: boolean }) => p.slug === slug
  );
  if (!proto?.hasDesign) return null;

  if (isOnDesign) {
    return (
      <Link href={`/prototypes/${slug}`} className={styles.designLink}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className={styles.designIcon}
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Prototype
      </Link>
    );
  }

  return (
    <Link href={`/prototypes/${slug}/design`} className={styles.designLink}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className={styles.designIcon}
      >
        <path
          d="M4 2h5l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 2v4h4"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Design Doc
    </Link>
  );
}
