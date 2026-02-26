import styles from "./page.module.css";

const hints = [
  { label: "Show All Commands", keys: "⇧⌘P" },
  { label: "Go to File", keys: "⌘P" },
  { label: "Find in Files", keys: "⇧⌘F" },
  { label: "Toggle Terminal", keys: "⌃`" },
  { label: "Open Settings", keys: "⌘," },
];

export default function HelloWorldPage() {
  return (
    <div className={styles.watermark}>
      <div className={styles.logo}>⌘</div>
      <dl className={styles.hints}>
        {hints.map((h) => (
          <div key={h.label} className={styles.hint}>
            <dt className={styles.hintLabel}>{h.label}</dt>
            <dd className={styles.hintKeys}>{h.keys}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
