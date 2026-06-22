# Voice Mode Input — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-06-17

---

## Problem

Developers using Copilot Chat often want to think out loud — describe a problem, dictate a prompt, or narrate intent — but the text input forces them to type everything. Existing voice modes (Siri, ChatGPT) are optimized for general consumers, not developer workflows where code terminology, file paths, and technical jargon are common.

## Solution

A focused voice input surface that:
1. Activates with a single click or Space press — no modal dialogs or permission flows interrupting flow
2. Provides real-time frequency visualization so the user gets immediate feedback that their mic is working and picking up speech
3. Uses the Web Speech API for live transcription, showing interim results as they speak
4. Renders a gradient animation driven by actual FFT frequency data from the microphone, creating a visceral connection between voice and UI response

The visual language uses expanding rings around a central orb (inspired by Siri) combined with a frequency bar chart and a flowing gradient canvas at the bottom edge — all colored with the VS Code 2026 accent palette.

---

## Open Questions

1. How should the transcript be submitted — auto-send after silence, or explicit "send" action?
2. Should there be a "code mode" that improves recognition of programming terms (custom grammar)?
3. What's the right placement in the VS Code chrome — inline in the chat input, or a floating overlay?
4. Should we support push-to-talk (hold Space) vs toggle (press Space)?
