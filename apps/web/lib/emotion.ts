/* Client-side emotion sensing (face-api.js) with consent + throttled emission */
"use client";

import * as React from "react";
import { apiRequest } from "./api";

type FaceApiModule = typeof import("face-api.js");
type EmotionLabel = "engaged" | "focused" | "confused" | "frustrated" | "bored" | "away" | "unknown";

const MODEL_BASE =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_FACE_MODELS_BASE ||
      "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights"
    : "";

const POLL_INTERVAL_MS = 2000;
const SEND_THROTTLE_MS = 5000;
const MIN_CONFIDENCE = 0.5;
const WINDOW_SIZE = 5;

type DetectorState = {
  running: boolean;
  permission: "prompt" | "granted" | "denied";
  currentLabel: EmotionLabel | null;
  confidence: number | null;
  lastSentAt: number | null;
  status: string;
};

type UseEmotionSensorArgs = {
  autoStart?: boolean;
  context?: string;
  previewRef?: React.RefObject<HTMLVideoElement | null>;
};

export function useEmotionSensor(args?: UseEmotionSensorArgs) {
  const [state, setState] = React.useState<DetectorState>({
    running: false,
    permission: "prompt",
    currentLabel: null,
    confidence: null,
    lastSentAt: null,
    status: "Idle",
  });

  const internalVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const faceApiRef = React.useRef<FaceApiModule | null>(null);
  const pollHandleRef = React.useRef<NodeJS.Timeout | null>(null);
  const windowRef = React.useRef<{ label: EmotionLabel; confidence: number }[]>([]);

  React.useEffect(() => {
    if (args?.autoStart) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensureFaceApi() {
    if (faceApiRef.current) return faceApiRef.current;
    const faceapi = await import("face-api.js");
    faceApiRef.current = faceapi;
    return faceapi;
  }

  async function loadModels(faceapi: FaceApiModule) {
    const url = MODEL_BASE;
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(url),
      faceapi.nets.faceExpressionNet.loadFromUri(url),
    ]);
  }

  function pushWindow(label: EmotionLabel, confidence: number) {
    const win = windowRef.current;
    win.push({ label, confidence });
    if (win.length > WINDOW_SIZE) win.shift();
  }

  function summarizeWindow() {
    const win = windowRef.current;
    if (!win.length) return { label: null, confidence: null, sample_count: 0 };

    const scores: Record<EmotionLabel, { count: number; total: number }> = {} as any;
    for (const entry of win) {
      if (!scores[entry.label]) scores[entry.label] = { count: 0, total: 0 };
      scores[entry.label].count += 1;
      scores[entry.label].total += entry.confidence;
    }

    const best = Object.entries(scores).sort((a, b) => b[1].count - a[1].count)[0];
    const label = best ? (best[0] as EmotionLabel) : null;
    const confidence = best ? best[1].total / best[1].count : null;
    return { label, confidence, sample_count: win.length };
  }

  function mapExpressionToLabel(expressions: Record<string, number>): { label: EmotionLabel; confidence: number } {
    const entries = Object.entries(expressions || {}).sort((a, b) => b[1] - a[1]);
    const [expr, prob] = entries[0] || ["unknown", 0];

    switch (expr) {
      case "angry":
      case "disgusted":
      case "fearful":
        return { label: "frustrated", confidence: prob };
      case "sad":
        return { label: "confused", confidence: prob };
      case "happy":
      case "surprised":
        return { label: "engaged", confidence: prob };
      case "neutral":
        return { label: "focused", confidence: prob };
      default:
        return { label: "unknown", confidence: prob };
    }
  }

  async function start() {
    try {
      if (state.running) return;
      const faceapi = await ensureFaceApi();
      setState((s) => ({ ...s, status: "Requesting camera..." }));
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setState((s) => ({ ...s, permission: "granted" }));

      const video =
        args?.previewRef?.current ||
        (() => {
          const el = document.createElement("video");
          el.style.position = "fixed";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          document.body.appendChild(el);
          return el;
        })();

      internalVideoRef.current = video;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;

      await loadModels(faceapi);
      setState((s) => ({ ...s, running: true, status: "Scanning..." }));

      const loop = async () => {
        if (!internalVideoRef.current || internalVideoRef.current.readyState < 2) {
          pollHandleRef.current = setTimeout(loop, POLL_INTERVAL_MS);
          return;
        }

        try {
          const detection = await faceapi
            .detectSingleFace(internalVideoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (!detection) {
            pushWindow("away", 0);
          } else {
            const mapped = mapExpressionToLabel(detection.expressions as any);
            pushWindow(mapped.label, mapped.confidence);
          }

          const summary = summarizeWindow();
          setState((s) => ({
            ...s,
            currentLabel: summary.label,
            confidence: summary.confidence,
            status: "Scanning...",
          }));
          maybeSend(summary);
        } catch (err) {
          console.error("emotion detect error", err);
          setState((s) => ({ ...s, status: "Detection error" }));
        }

        pollHandleRef.current = setTimeout(loop, POLL_INTERVAL_MS);
      };

      pollHandleRef.current = setTimeout(loop, POLL_INTERVAL_MS);
    } catch (err: any) {
      console.error("emotion start failed", err);
      setState((s) => ({ ...s, permission: "denied", status: err?.message || "Camera denied" }));
    }
  }

  async function stop() {
    if (pollHandleRef.current) clearTimeout(pollHandleRef.current);
    pollHandleRef.current = null;
    windowRef.current = [];

    if (internalVideoRef.current) {
      internalVideoRef.current.srcObject = null;
      if (!args?.previewRef?.current || args.previewRef.current !== internalVideoRef.current) {
        internalVideoRef.current.remove();
      }
      internalVideoRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setState((s) => ({ ...s, running: false, status: "Idle" }));
  }

  async function maybeSend(summary: { label: EmotionLabel | null; confidence: number | null; sample_count: number }) {
    if (!summary.label || summary.confidence === null) return;
    if (summary.confidence < MIN_CONFIDENCE) return;
    const now = Date.now();
    if (state.lastSentAt && now - state.lastSentAt < SEND_THROTTLE_MS) return;

    try {
      await apiRequest("/emotion-events", {
        method: "POST",
        body: JSON.stringify({
          label: summary.label,
          confidence: summary.confidence,
          context: args?.context || "learn-session",
          window_ms: POLL_INTERVAL_MS * summary.sample_count,
          sample_count: summary.sample_count,
        }),
      });
      setState((s) => ({ ...s, lastSentAt: now, status: `Sent: ${summary.label}` }));
    } catch (err) {
      console.error("send emotion failed", err);
      setState((s) => ({ ...s, status: "Send failed" }));
    }
  }

  return {
    state,
    start,
    stop,
  };
}
