import Link from "next/link";
import base from "../base.module.css";
import styles from "./layout.module.css";
import { DesignDocLink } from "./design-doc-link";

export default function PrototypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={base.page}>
      <nav className={base.nav}>
        <div className={`${base.containerWide} ${styles.navInner}`}>
          <Link href="/" className={styles.backLink}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.backIcon}
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All Prototypes
          </Link>
          <DesignDocLink />
        </div>
      </nav>
      <main className={`${base.containerWide} ${styles.main}`}>{children}</main>
    </div>
  );
}
