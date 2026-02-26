"use client";

import { useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

export default function CounterDemoPage() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<{ value: number; action: string; time: string }[]>([]);

  function record(action: string, next: number) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setHistory((h) => [{ value: next, action, time }, ...h].slice(0, 50));
  }

  function increment() {
    const next = count + 1;
    setCount(next);
    record("increment", next);
  }

  function decrement() {
    const next = count - 1;
    setCount(next);
    record("decrement", next);
  }

  function reset() {
    setCount(0);
    record("reset", 0);
  }

  return (
    <div className={styles.panel}>
      {/* Panel title bar */}
      <div className={styles.titleBar}>
        <div className={styles.titleSection}>
          <Codicon name="pulse" className={styles.titleIcon} />
          <span className={styles.titleText}>Counter</span>
          {count !== 0 && (
            <span className={styles.badge}>{count}</span>
          )}
        </div>
        <div className={styles.toolbar}>
          <button className={styles.toolbarButton} onClick={decrement} title="Decrement">
            <Codicon name="remove" />
          </button>
          <button className={styles.toolbarButton} onClick={increment} title="Increment">
            <Codicon name="add" />
          </button>
          <div className={styles.toolbarSeparator} />
          <button className={styles.toolbarButton} onClick={reset} title="Reset Counter">
            <Codicon name="discard" />
          </button>
        </div>
      </div>

      {/* Panel body */}
      <div className={styles.body}>
        {/* Current value display */}
        <div className={styles.valueSection}>
          <div className={styles.valueLabel}>Current Value</div>
          <div className={styles.value}>{count}</div>
          <div className={styles.valueMeta}>
            {count > 0 && <span className={styles.positive}>+{count} from zero</span>}
            {count < 0 && <span className={styles.negative}>{count} from zero</span>}
            {count === 0 && <span className={styles.neutral}>at zero</span>}
          </div>
        </div>

        {/* Quick actions row */}
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={decrement}>
            <Codicon name="chevron-down" />
            <span>Decrement</span>
          </button>
          <button className={`${styles.actionButton} ${styles.actionPrimary}`} onClick={increment}>
            <Codicon name="chevron-up" />
            <span>Increment</span>
          </button>
        </div>

        {/* History log */}
        {history.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historyHeader}>
              <Codicon name="history" className={styles.historyIcon} />
              <span>History</span>
              <span className={styles.historyCount}>{history.length}</span>
            </div>
            <div className={styles.historyList}>
              {history.map((entry, i) => (
                <div key={i} className={styles.historyItem}>
                  <Codicon
                    name={entry.action === "increment" ? "arrow-up" : entry.action === "decrement" ? "arrow-down" : "discard"}
                    className={
                      entry.action === "increment" ? styles.historyUp :
                      entry.action === "decrement" ? styles.historyDown :
                      styles.historyReset
                    }
                  />
                  <span className={styles.historyAction}>{entry.action}</span>
                  <span className={styles.historyValue}>{entry.value}</span>
                  <span className={styles.historyTime}>{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
