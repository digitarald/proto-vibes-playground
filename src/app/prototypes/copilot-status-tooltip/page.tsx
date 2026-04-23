"use client";

import { useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Tab = "usage" | "quick-settings";
type SyncState = "disabled" | "enabled-off" | "enabled-on";
const SYNC_STATES: SyncState[] = ["disabled", "enabled-off", "enabled-on"];
const SYNC_LABELS: Record<SyncState, string> = {
  "disabled": "1 — Sync disabled",
  "enabled-off": "2 — Enabled, workspace off",
  "enabled-on": "3 — Enabled, workspace on",
};

export default function CopilotStatusTooltipPage() {
  const [activeTab, setActiveTab] = useState<Tab>("quick-settings");
  const [allFiles, setAllFiles] = useState(true);
  const [nextEdit, setNextEdit] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>("enabled-on");

  return (
    <div className={styles.scene}>
      {/* Tooltip popup */}
      <div className={styles.tooltip}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>Copilot Free</span>
          <button className={styles.headerAction}>
            <Codicon name="settings-gear" />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "usage" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("usage")}
          >
            Usage
          </button>
          <button
            className={`${styles.tab} ${activeTab === "quick-settings" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("quick-settings")}
          >
            Quick Settings
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {activeTab === "quick-settings" && (
            <>
              {/* All files toggle */}
              <div
                className={styles.toggleRow}
                onClick={() => setAllFiles(!allFiles)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.checkbox}>
                  {allFiles && <Codicon name="check" />}
                </div>
                <span className={styles.toggleLabel}>All files</span>
              </div>

              {/* Next edit suggestions toggle */}
              <div
                className={styles.toggleRow}
                onClick={() => setNextEdit(!nextEdit)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.checkbox}>
                  {nextEdit && <Codicon name="check" />}
                </div>
                <span className={styles.toggleLabel}>Next edit suggestions</span>
              </div>

              {/* Eagerness */}
              <div className={styles.eagernessRow}>
                <span className={styles.eagernessLabel}>Eagerness</span>
                <span className={styles.eagernessValue}>Auto</span>
              </div>

              <hr className={styles.divider} />

              {/* Snooze */}
              <div className={styles.snoozeRow}>
                <button className={styles.snoozeBtn}>Snooze</button>
                <span className={styles.snoozeHint}>Hide suggestions for 5 min</span>
              </div>

              <hr className={styles.divider} />

              {/* Sessions Sync — State 1: Disabled */}
              {syncState === "disabled" && (
                <div className={styles.syncSection}>
                  <div className={styles.syncHeader}>
                    <Codicon name="cloud" style={{ fontSize: 14, color: "var(--muted)" }} />
                    <span className={styles.toggleLabel}>Sessions Sync</span>
                  </div>
                  <div className={styles.syncStatus}>
                    <div className={styles.syncIndicator}>
                      <Codicon name="database" style={{ fontSize: 14 }} />
                      <span className={styles.syncLabel}>12 sessions stored locally</span>
                    </div>
                    <button
                      className={styles.enableBtn}
                      onClick={() => setSyncState("enabled-off")}
                    >
                      <Codicon name="cloud-upload" style={{ fontSize: 14 }} />
                      Enable Sessions Sync
                    </button>
                  </div>
                </div>
              )}

              {/* Sessions Sync — State 2: Enabled, workspace toggle */}
              {syncState === "enabled-off" && (
                <div className={styles.syncSection}>
                  <div
                    className={styles.toggleRow}
                    onClick={() => setSyncState("enabled-on")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.checkboxOff} />
                    <span className={styles.toggleLabel}>Sessions Sync</span>
                    <span className={styles.syncBadge}>off for this workspace</span>
                  </div>
                  <div className={styles.syncStatus}>
                    <div className={styles.syncIndicator}>
                      <Codicon name="database" style={{ fontSize: 14 }} />
                      <span className={styles.syncLabel}>12 sessions local only</span>
                    </div>
                    <div className={styles.syncLegend}>
                      <span className={styles.legendItem}>
                        <span className={styles.legendDotLocal} />
                        12 local
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions Sync — State 3: Enabled for this repo */}
              {syncState === "enabled-on" && (
                <div className={styles.syncSection}>
                  <div
                    className={styles.toggleRow}
                    onClick={() => setSyncState("enabled-off")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.checkbox}>
                      <Codicon name="check" />
                    </div>
                    <span className={styles.toggleLabel}>Sessions Sync</span>
                  </div>
                  <div className={styles.syncStatus}>
                    <div className={styles.syncIndicator}>
                      <Codicon name="cloud" style={{ fontSize: 14, color: "var(--accent)" }} />
                      <span className={styles.syncLabel}>12 sessions synced to cloud</span>
                    </div>
                    <div className={styles.syncBar}>
                      <div className={styles.syncBarCloud} style={{ width: "75%" }} />
                      <div className={styles.syncBarLocal} style={{ width: "25%" }} />
                    </div>
                    <div className={styles.syncLegend}>
                      <span className={styles.legendItem}>
                        <span className={styles.legendDotCloud} />
                        9 cloud
                      </span>
                      <span className={styles.legendItem}>
                        <span className={styles.legendDotLocal} />
                        3 local
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "usage" && (
            <div style={{ padding: "12px 0", color: "var(--muted)", fontSize: "0.8125rem" }}>
              Usage details will appear here.
            </div>
          )}
        </div>
      </div>

      {/* State toggle */}
      <div className={styles.stateToggle}>
        {SYNC_STATES.map((s) => (
          <button
            key={s}
            className={`${styles.stateBtn} ${syncState === s ? styles.stateBtnActive : ""}`}
            onClick={() => setSyncState(s)}
          >
            {SYNC_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <button className={`${styles.statusIcon} ${styles.statusIconActive}`}>
          <Codicon name="copilot" />
        </button>
        <button className={styles.statusIcon}>
          <Codicon name="organization" />
        </button>
        <button className={styles.statusIcon}>
          <Codicon name="bell" />
        </button>
      </div>
    </div>
  );
}
