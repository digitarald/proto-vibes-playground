"use client";

import { useMemo, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Model = {
  id: string;
  name: string;
  family: string;
  status: "ready" | "training" | "queued";
  score: number;
  dataBlend: number;
  regularization: number;
  learningRate: number;
};

const INITIAL_MODELS: Model[] = [
  {
    id: "nova-vision-lite",
    name: "Nova Vision Lite",
    family: "vision",
    status: "ready",
    score: 91,
    dataBlend: 62,
    regularization: 24,
    learningRate: 31,
  },
  {
    id: "aurora-code-xl",
    name: "Aurora Code XL",
    family: "code",
    status: "training",
    score: 88,
    dataBlend: 70,
    regularization: 28,
    learningRate: 41,
  },
  {
    id: "atlas-reasoner",
    name: "Atlas Reasoner",
    family: "reasoning",
    status: "queued",
    score: 84,
    dataBlend: 56,
    regularization: 36,
    learningRate: 27,
  },
  {
    id: "sonnet-assistant",
    name: "Sonnet Assistant",
    family: "assistant",
    status: "ready",
    score: 90,
    dataBlend: 64,
    regularization: 20,
    learningRate: 35,
  },
];

function statusIcon(status: Model["status"]) {
  if (status === "ready") return "check";
  if (status === "training") return "loading";
  return "clock";
}

export default function AiModelGardenWeightsTrainingStudioPage() {
  const [models] = useState(INITIAL_MODELS);
  const [activeModelId, setActiveModelId] = useState(models[1]?.id ?? models[0].id);
  const activeModel = useMemo(
    () => models.find((model) => model.id === activeModelId) ?? models[0],
    [activeModelId, models]
  );

  const [dataBlend, setDataBlend] = useState(activeModel.dataBlend);
  const [regularization, setRegularization] = useState(activeModel.regularization);
  const [learningRate, setLearningRate] = useState(activeModel.learningRate);
  const [autoTune, setAutoTune] = useState(true);

  return (
    <div className={styles.studio}>
      <header className={styles.topbar}>
        <div className={styles.titleWrap}>
          <Codicon name="symbol-namespace" className={styles.titleIcon} />
          <div>
            <p className={styles.eyebrow}>AI Model Garden</p>
            <h1 className={styles.title}>Weights Training Studio</h1>
          </div>
        </div>
        <button className={styles.primaryAction}>
          <Codicon name="rocket" />
          Start training run
        </button>
      </header>

      <div className={styles.grid}>
        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Model Garden</h2>
            <span>{models.length} models</span>
          </div>
          <div className={styles.modelList}>
            {models.map((model) => {
              const active = model.id === activeModelId;
              return (
                <button
                  key={model.id}
                  className={`${styles.modelItem} ${active ? styles.modelItemActive : ""}`}
                  onClick={() => {
                    setActiveModelId(model.id);
                    setDataBlend(model.dataBlend);
                    setRegularization(model.regularization);
                    setLearningRate(model.learningRate);
                  }}
                >
                  <div className={styles.modelTitleRow}>
                    <span>{model.name}</span>
                    <span className={styles.score}>{model.score}</span>
                  </div>
                  <div className={styles.modelMeta}>
                    <span>{model.family}</span>
                    <span className={styles.status}>
                      <Codicon
                        name={statusIcon(model.status)}
                        spin={model.status === "training"}
                      />
                      {model.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Training Weights</h2>
            <span>{activeModel.name}</span>
          </div>

          <div className={styles.sliders}>
            <label className={styles.sliderRow}>
              <span>Data blend</span>
              <input
                type="range"
                min={0}
                max={100}
                value={dataBlend}
                onChange={(event) => setDataBlend(Number(event.target.value))}
              />
              <strong>{dataBlend}%</strong>
            </label>

            <label className={styles.sliderRow}>
              <span>Regularization</span>
              <input
                type="range"
                min={0}
                max={100}
                value={regularization}
                onChange={(event) => setRegularization(Number(event.target.value))}
              />
              <strong>{regularization}%</strong>
            </label>

            <label className={styles.sliderRow}>
              <span>Learning rate</span>
              <input
                type="range"
                min={0}
                max={100}
                value={learningRate}
                onChange={(event) => setLearningRate(Number(event.target.value))}
              />
              <strong>{learningRate}%</strong>
            </label>
          </div>

          <button
            className={`${styles.toggle} ${autoTune ? styles.toggleActive : ""}`}
            onClick={() => setAutoTune((value) => !value)}
          >
            <Codicon name={autoTune ? "check" : "circle-large-outline"} />
            Auto-tune against validation loss
          </button>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Run Telemetry</h2>
            <span>Live</span>
          </div>

          <div className={styles.metricGrid}>
            <article className={styles.metricCard}>
              <span>Epochs</span>
              <strong>38 / 120</strong>
            </article>
            <article className={styles.metricCard}>
              <span>Validation loss</span>
              <strong>0.142</strong>
            </article>
            <article className={styles.metricCard}>
              <span>GPU utilization</span>
              <strong>93%</strong>
            </article>
            <article className={styles.metricCard}>
              <span>Cost / hour</span>
              <strong>$7.92</strong>
            </article>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineRow}>
              <span>Queued dataset rebalance</span>
              <span>+2m</span>
            </div>
            <div className={styles.timelineRow}>
              <span>Weight clipping checkpoint</span>
              <span>+6m</span>
            </div>
            <div className={styles.timelineRow}>
              <span>Candidate export to evaluation</span>
              <span>+14m</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
