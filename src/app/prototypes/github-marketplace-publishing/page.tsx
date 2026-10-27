"use client";

import dynamic from "next/dynamic";
import styles from "./page.module.css";

// Load Primer after hydration: its focus-visible polyfill mutates the document root.
const Publisher = dynamic(() => import("./publisher"), {
  ssr: false,
  loading: () => <div className={styles.loading} role="status">Loading publisher workspace</div>,
});

export default function Page() {
  return <Publisher />;
}
