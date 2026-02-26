import { PrototypeIndex } from "./prototype-index";
import base from "./base.module.css";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={base.page}>
      <header className={base.nav}>
        <div className={`${base.container} ${styles.header}`}>
          <h1 className={styles.title}>Proto Vibes</h1>
          <p className={styles.subtitle}>
            A playground for rapid UI prototyping — self-contained, disposable, and always live.
          </p>
        </div>
      </header>

      <PrototypeIndex />

      <footer className={styles.footer}>
        <div className={`${base.container} ${styles.footerInner}`}>
          <p className={styles.ctaTitle}>Build something new</p>
          <p className={styles.ctaDescription}>
            Ask Copilot to create a prototype — describe what you want and it
            scaffolds everything for you.
          </p>
          <div className={styles.ctaBadge}>
            <svg className={styles.ctaIcon} viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 11.41l-.07.07H7.14l-.07-.07V9.55l.07-.07h1.72l.07.07v1.86zm.12-3.36l-.15.07H7.1l-.14-.07-.08-.1L6.44 4.2l.07-.12h3l.06.12L9.13 7.95l-.08.1z" />
            </svg>
            <span className={styles.ctaCode}>/new-prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
