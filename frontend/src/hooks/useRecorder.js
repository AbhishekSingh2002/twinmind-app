import { useRef, useState, useCallback, useEffect } from "react";

const CHUNK_INTERVAL_MS = 30_000; // flush audio every 30s

/**
 * useRecorder — encapsulates all MediaRecorder + transcription logic
 *
 * @param {object} opts
 * @param {string}   opts.apiKey
 * @param {function} opts.onChunk   — called with { text, time } on each transcribed chunk
 * @param {function} opts.onStatus  — called with "idle" | "recording" | "processing"
 * @param {function} opts.onError   — called with error message string
 */
export function useRecorder({ apiKey, onChunk, onStatus, onError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration]       = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef        = useRef(null);
  const blobsRef         = useRef([]);
  const flushTimerRef    = useRef(null);
  const durationTimerRef = useRef(null);
  const isRecordingRef   = useRef(false); // stable ref for closures

  /* keep ref in sync */
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  /* duration counter */
  useEffect(() => {
    if (isRecording) {
      durationTimerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      clearInterval(durationTimerRef.current);
    }
    return () => clearInterval(durationTimerRef.current);
  }, [isRecording]);

  /* ── flush accumulated blobs → Whisper ──────────────────────── */
  const flush = useCallback(async () => {
    if (blobsRef.current.length === 0) return;

    const blob = new Blob(blobsRef.current, { type: "audio/webm" });
    blobsRef.current = [];
    if (blob.size < 1500) return; // skip near-silent chunks

    onStatus?.("processing");
    try {
      const form = new FormData();
      form.append("audio", blob, "chunk.webm");
      if (apiKey) form.append("apiKey", apiKey);

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");

      if (data.text?.trim()) {
        onChunk?.({ text: data.text.trim(), time: data.timestamp });
      }
    } catch (e) {
      onError?.(e.message);
    } finally {
      onStatus?.(isRecordingRef.current ? "recording" : "idle");
    }
  }, [apiKey, onChunk, onStatus, onError]);

  /* ── start ───────────────────────────────────────────────────── */
  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) blobsRef.current.push(e.data);
      };

      mr.start(1000); // fire ondataavailable every 1s
      setIsRecording(true);
      setDuration(0);
      onStatus?.("recording");

      flushTimerRef.current = setInterval(flush, CHUNK_INTERVAL_MS);
    } catch (e) {
      onError?.("Microphone access denied. Please allow mic permissions.");
    }
  }, [flush, onStatus, onError]);

  /* ── stop ────────────────────────────────────────────────────── */
  const stop = useCallback(async () => {
    clearInterval(flushTimerRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    onStatus?.("idle");

    // wait for final ondataavailable to fire
    await new Promise((r) => setTimeout(r, 600));
    await flush();
  }, [flush, onStatus]);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      clearInterval(flushTimerRef.current);
      clearInterval(durationTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { isRecording, duration, start, stop };
}