"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

const BAR_COUNT = 64;
const FFT_SIZE = 256;

// Color stops for the frequency gradient (low → high frequency)
const GRADIENT_COLORS = [
  [57, 148, 188], // --accent blue
  [72, 201, 196], // teal
  [193, 132, 198], // purple
  [79, 143, 221], // keyword blue
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getBarColor(index: number, total: number): string {
  const t = index / (total - 1);
  const segment = t * (GRADIENT_COLORS.length - 1);
  const i = Math.floor(segment);
  const f = segment - i;
  const c0 = GRADIENT_COLORS[Math.min(i, GRADIENT_COLORS.length - 1)];
  const c1 = GRADIENT_COLORS[Math.min(i + 1, GRADIENT_COLORS.length - 1)];
  const r = Math.round(lerp(c0[0], c1[0], f));
  const g = Math.round(lerp(c0[1], c1[1], f));
  const b = Math.round(lerp(c0[2], c1[2], f));
  return `rgb(${r}, ${g}, ${b})`;
}

interface ChatMessage {
  id: number;
  role: "user" | "agent";
  text: string;
}

// Simulated agent responses for demo
const AGENT_RESPONSES = [
  "Got it. I'll refactor that function to use `async/await` instead of callbacks.",
  "Looking at the error — it's a type mismatch on line 42. The `response.data` is `unknown`, you need to cast it.",
  "I've created a new test file at `src/__tests__/auth.test.ts` with coverage for the edge cases you mentioned.",
  "The build is failing because `@types/node` is outdated. Try `npm install -D @types/node@latest`.",
  "That's a good approach. I'd also suggest adding error boundaries around the lazy-loaded routes.",
];

export default function VoiceModeInputPage() {
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const msgIdRef = useRef(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const controlBarRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Frequency data buffer
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const addMessage = useCallback((role: "user" | "agent", text: string) => {
    const id = ++msgIdRef.current;
    setMessages((prev) => [...prev, { id, role, text }]);
    setTimeout(scrollToBottom, 50);
  }, [scrollToBottom]);

  const simulateAgentResponse = useCallback(() => {
    setTimeout(() => {
      const response = AGENT_RESPONSES[Math.floor(Math.random() * AGENT_RESPONSES.length)];
      addMessage("agent", response);
    }, 800 + Math.random() * 1200);
  }, [addMessage]);

  function average(arr: Uint8Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end; i++) sum += arr[i];
    return sum / (end - start);
  }

  const drawVisualization = useCallback(() => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!analyser || !dataArray) return;

    analyser.getByteFrequencyData(dataArray);

    // Update bars
    const step = Math.max(1, Math.floor(dataArray.length / BAR_COUNT));
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = barsRef.current[i];
      if (!bar) continue;
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j] || 0;
      }
      const avg = sum / step;
      const height = Math.max(3, (avg / 255) * 28);
      bar.style.height = `${height}px`;
    }

    // Update glow intensity CSS variable on the control bar
    const avgLow = average(dataArray, 0, Math.floor(dataArray.length * 0.33));
    const avgMid = average(dataArray, Math.floor(dataArray.length * 0.33), Math.floor(dataArray.length * 0.66));
    const avgHigh = average(dataArray, Math.floor(dataArray.length * 0.66), dataArray.length);
    const intensity = (avgLow + avgMid + avgHigh) / (3 * 255);
    if (controlBarRef.current) {
      controlBarRef.current.style.setProperty('--glow-intensity', String(Math.min(1, intensity * 2)));
    }

    animFrameRef.current = requestAnimationFrame(drawVisualization);
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setListening(true);
      setFinalText("");
      setInterimText("");

      // Start visualization loop
      animFrameRef.current = requestAnimationFrame(drawVisualization);

      // Start Web Speech API recognition
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let final = "";
          let interim = "";
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript;
            } else {
              interim += result[0].transcript;
            }
          }
          setFinalText(final);
          setInterimText(interim);
        };

        recognition.onerror = (event) => {
          if (event.error === "not-allowed") {
            setPermissionDenied(true);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      setPermissionDenied(true);
    }
  }, [drawVisualization]);

  const stopListening = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    barsRef.current.forEach((bar) => {
      if (bar) bar.style.height = "3px";
    });

    // Submit the transcript as a user message
    const fullText = (finalText + interimText).trim();
    if (fullText) {
      addMessage("user", fullText);
      simulateAgentResponse();
    }

    setListening(false);
    setFinalText("");
    setInterimText("");
  }, [finalText, interimText, addMessage, simulateAgentResponse]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // Keyboard shortcut: Space to toggle
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        toggleListening();
      }
      if (e.code === "Escape" && listening) {
        stopListening();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleListening, listening, stopListening]);

  // Auto-scroll on new messages
  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const currentTranscript = finalText + interimText;

  return (
    <div className={styles.container}>
      {/* Chat area */}
      <div className={styles.chatArea}>
        {messages.length === 0 && !listening && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Codicon name="mic" /></span>
            <p className={styles.emptyText}>Voice mode ready</p>
            <p className={styles.emptyHint}>Press Space or click the mic to start talking</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.role === "user" ? styles.messageUser : styles.messageAgent}`}
          >
            {msg.text}
          </div>
        ))}

        {/* Live transcript while speaking */}
        {listening && currentTranscript && (
          <div className={styles.liveTranscript}>
            {finalText}
            <span className={styles.interimText}>{interimText}</span>
            <span className={styles.transcriptCursor} />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom control bar */}
      <div
        ref={controlBarRef}
        className={`${styles.controlBar} ${listening ? styles.active : ""}`}
      >

        {/* Mic button */}
        <button
          className={`${styles.micButton} ${listening ? styles.listening : ""}`}
          onClick={toggleListening}
          title={listening ? "Stop" : "Start voice input"}
        >
          {listening && <span className={styles.micPulse} />}
          <span className={styles.micIcon}>
            <Codicon name="mic" />
          </span>
        </button>

        {/* Frequency visualizer */}
        <div className={styles.visualizer}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) barsRef.current[i] = el;
              }}
              className={styles.bar}
              style={{
                height: "3px",
                backgroundColor: getBarColor(i, BAR_COUNT),
              }}
            />
          ))}
        </div>

        {/* Status / controls */}
        {listening ? (
          <>
            <span className={`${styles.status} ${styles.active}`}>Listening…</span>
            <button
              className={styles.stopButton}
              onClick={stopListening}
              title="Stop & send"
            >
              <Codicon name="debug-stop" />
            </button>
          </>
        ) : (
          <>
            {permissionDenied ? (
              <span className={styles.status}><Codicon name="warning" /> Mic denied</span>
            ) : (
              <span className={styles.hint}>
                <span className={styles.kbd}>Space</span> speak
                <span className={styles.kbd}>Esc</span> stop
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
