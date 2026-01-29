"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type GasRes = {
  chain: string;
  gasPriceWei: string;
  gasPriceGwei: string;
  fetchedAt: number;
};

const REFRESH_OPTIONS: { label: string; ms: number }[] = [
  { label: "Off", ms: 0 },
  { label: "5s", ms: 5_000 },
  { label: "10s", ms: 10_000 },
  { label: "20s", ms: 20_000 },
  { label: "30s", ms: 30_000 },
  { label: "60s", ms: 60_000 },
];

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function fmtGwei(v: number) {
  if (!Number.isFinite(v)) return "—";
  if (v >= 100) return v.toFixed(0);
  if (v >= 10) return v.toFixed(1);
  if (v >= 1) return v.toFixed(2);
  if (v >= 0.1) return v.toFixed(3);
  return v.toFixed(4);
}

function moodOf(gwei: number) {
  // Keep this simple + stable across time.
  if (!Number.isFinite(gwei)) return { label: "No data", tone: "neutral" as const };
  if (gwei <= 0.2) return { label: "Cheap", tone: "good" as const };
  if (gwei <= 1.0) return { label: "Normal", tone: "neutral" as const };
  return { label: "Hot", tone: "bad" as const };
}

function timeHHMMSS(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function sparkPoints(samples: number[], w = 520, h = 92, pad = 10) {
  if (!samples.length) return "";
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const span = Math.max(1e-9, max - min);

  const xStep = (w - pad * 2) / Math.max(1, samples.length - 1);
  return samples
    .map((v, i) => {
      const x = pad + i * xStep;
      const yNorm = (v - min) / span; // 0..1
      const y = pad + (1 - yNorm) * (h - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function Page() {

useEffect(() => {
  // Tell the host (Base/Farcaster) the mini app is ready.
  // Safe no-op in regular browsers.
  sdk.actions.ready().catch(() => {});
}, []);

  const [gas, setGas] = useState<GasRes | null>(null);
  const [samples, setSamples] = useState<number[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [refreshMs, setRefreshMs] = useState<number>(10_000);
  const [now, setNow] = useState<number>(() => Date.now());
  const [lastClientFetchAt, setLastClientFetchAt] = useState<number | null>(null);

  const lastFetchedAt = lastClientFetchAt ?? gas?.fetchedAt ?? null;
  const cur = useMemo(() => (gas ? Number(gas.gasPriceGwei) : NaN), [gas]);
  const mood = useMemo(() => moodOf(cur), [cur]);

  const minMax = useMemo(() => {
    if (!samples.length) return { min: NaN, max: NaN };
    return { min: Math.min(...samples), max: Math.max(...samples) };
  }, [samples]);

  const pos = useMemo(() => {
    // Position within the recent range (no "scale max" needed).
    if (!Number.isFinite(cur) || !Number.isFinite(minMax.min) || !Number.isFinite(minMax.max)) return 0.5;
    const span = minMax.max - minMax.min;
    if (span <= 0) return 0.5;
    return clamp01((cur - minMax.min) / span);
  }, [cur, minMax]);

  const nextIn = useMemo(() => {
    const basis = lastClientFetchAt ?? lastFetchedAt;
    if (!refreshMs || !basis) return null;
    const left = refreshMs - (now - basis);
    return Math.max(0, Math.ceil(left / 1000));
  }, [refreshMs, lastClientFetchAt, lastFetchedAt, now]);

  const timerRef = useRef<number | null>(null);
  const refreshRef = useRef<number | null>(null);

  async function fetchGas() {
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/gas", { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to fetch gas");
      const j = (await r.json()) as GasRes;
      const g = Number(j.gasPriceGwei);
      setGas(j);
      setLastClientFetchAt(Date.now());
      setSamples((prev) => {
        const next = [...prev, g].filter((x) => Number.isFinite(x));
        return next.slice(-30);
      });
      setNow(Date.now());
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGas();
  }, []);

  useEffect(() => {
    // "clock" for the countdown
    if (!refreshMs) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [refreshMs]);

  useEffect(() => {
    // auto refresh loop
    if (refreshRef.current) window.clearInterval(refreshRef.current);
    refreshRef.current = null;

    if (!refreshMs) return;

    refreshRef.current = window.setInterval(() => {
      fetchGas();
    }, refreshMs);

    return () => {
      if (refreshRef.current) window.clearInterval(refreshRef.current);
      refreshRef.current = null;
    };
  }, [refreshMs]);

  async function copyText() {
    const text =
      `Base Gas Checker\n` +
      `Gas: ${fmtGwei(cur)} gwei\n` +
      (Number.isFinite(minMax.min) ? `Min/Max (30): ${fmtGwei(minMax.min)} / ${fmtGwei(minMax.max)}\n` : "") +
      (gas?.fetchedAt ? `Updated: ${timeHHMMSS((lastClientFetchAt ?? gas.fetchedAt) as number)}\n` : "");

    try {
      await navigator.clipboard.writeText(text);
      setErr("Copied.");
      setTimeout(() => setErr(null), 900);
    } catch {
      setErr("Copy blocked in this browser. Long-press and copy instead.");
    }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Base gas is ${fmtGwei(cur)} gwei • ${mood.label}\n${url}`;

    try {
      await sdk.actions.composeCast({ text });
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setErr("Share text copied.");
        setTimeout(() => setErr(null), 900);
      } catch {
        setErr("Share not available here.");
      }
    }
  }

  async function addToApps() {
    try {
      await sdk.actions.addMiniApp();
    } catch {
      setErr("Add failed. Try from inside Base App.");
    }
  }

  const points = useMemo(() => sparkPoints(samples), [samples]);

  return (
    <div className={"wrap tone-" + mood.tone}>
      <div className="shell">
        <header className="head">
          <div className="titleBlock">
            <h1>Base Gas Checker</h1>
            <p>Live Base L2 gas — fast, minimal, and readable.</p>
          </div>

          <div className={"badge " + mood.tone}>
            <span className="dot" />
            {mood.label}
          </div>
        </header>

        <div className="grid">
          <section className="card left">
            <div className="subhead">
              <div className="label">Auto refresh</div>
              <div className="meta">{refreshMs ? `next in ${nextIn ?? "—"}s` : "off"}</div>
            </div>

            <div className="seg">
              {REFRESH_OPTIONS.map((o) => (
                <button
                  key={o.ms}
                  className={"segBtn " + (refreshMs === o.ms ? "on" : "")}
                  onClick={() => setRefreshMs(o.ms)}
                  type="button"
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="row">
              <button className="btn" onClick={fetchGas} disabled={loading} type="button">
                {loading ? "Refreshing…" : "Refresh now"}
              </button>
              <button className="btn ghost" onClick={copyText} type="button">
                Copy text
              </button>
            </div>

            <div className="row">
              <button className="btn ghost" onClick={share} type="button">
                Share
              </button>
              <button className="btn" onClick={addToApps} type="button">
                Add to my apps
              </button>
            </div>

            {err && <div className={"toast " + (err === "Copied." || err === "Share text copied." ? "ok" : "warn")}>{err}</div>}

            <div className="miniNote">
              Data source: Base RPC gas price (right-now signal).
            </div>
          </section>

          <section className="card right">
            <div className="gaugeWrap">
              <div className="ring" style={{ background: `conic-gradient(var(--accent) ${pos * 360}deg, rgba(255,255,255,.08) 0)` }}>
                <div className="ringInner">
                  <div className="big">{fmtGwei(cur)}</div>
                  <div className="unit">gwei</div>
                  <div className="time">{gas?.fetchedAt ? `Updated ${timeHHMMSS((lastClientFetchAt ?? gas.fetchedAt) as number)}` : "—"}</div>
                </div>
              </div>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="k">Chain</div>
                <div className="v">base</div>
              </div>
              <div className="stat">
                <div className="k">Samples</div>
                <div className="v">{samples.length}/30</div>
              </div>
              <div className="stat">
                <div className="k">Min / Max</div>
                <div className="v">
                  {Number.isFinite(minMax.min) ? `${fmtGwei(minMax.min)} / ${fmtGwei(minMax.max)}` : "—"}
                </div>
              </div>
            </div>

            <div className="spark">
              <svg viewBox="0 0 520 92" aria-label="gas history">
                <polyline points={points} fill="none" stroke="rgba(243,244,246,.90)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
