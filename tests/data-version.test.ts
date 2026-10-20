import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { loadDataset } from "../src/lib/traffic";

/**
 * The index is live: the night publish rewrites the ten CSVs under a new content-hash
 * `data_version`, and the public origin sits behind an edge cache that holds a static file for
 * hours. So no data request may go out on a bare `/data/x.csv` URL — the version rides on every
 * one of them, and a host with no manifest falls back to a per-load token rather than the
 * cacheable plain URL. These tests pin both halves of that contract.
 */
const realFetch = globalThis.fetch;
const urls: string[] = [];
let manifest: { status: number; body: string };

beforeEach(() => {
  urls.length = 0;
  manifest = { status: 200, body: JSON.stringify({ data_version: "2026-10-19-003d069b8ade" }) };
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    urls.push(url);
    if (url.startsWith("/data/manifest.json"))
      return new Response(manifest.body, { status: manifest.status });
    // Every CSV is served empty: the URL is what these tests assert, not the rows.
    return new Response("", { status: 200 });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("live-data cache busting", () => {
  test("reads a cache-busted manifest, then versions every CSV with its content hash", async () => {
    await loadDataset();
    expect(urls[0]).toMatch(/^\/data\/manifest\.json\?ts=\d+$/);
    const csvs = urls.filter((u) => u.includes(".csv?v="));
    expect(csvs.length).toBe(10);
    for (const url of csvs) expect(url).toContain("?v=2026-10-19-003d069b8ade");
  });

  test("no manifest: every CSV still carries one shared per-load token", async () => {
    manifest = { status: 404, body: "" };
    await loadDataset();
    const csvs = urls.filter((u) => u.includes(".csv?v="));
    expect(csvs.length).toBe(10);
    const tokens = new Set(csvs.map((u) => u.split("?v=")[1]));
    expect(tokens.size).toBe(1);
    const [token] = [...tokens];
    expect(token).toMatch(/^ts-\d+$/);
  });

  test("a manifest that cannot be read is treated as absent, not as a load failure", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      urls.push(url);
      if (url.startsWith("/data/manifest.json")) throw new TypeError("Failed to fetch");
      return new Response("", { status: 200 });
    }) as typeof fetch;
    await expect(loadDataset()).resolves.toBeDefined();
    expect(urls[0]).toMatch(/^\/data\/manifest\.json\?ts=\d+$/);
    const csvs = urls.filter((u) => u.includes(".csv?v="));
    expect(csvs.length).toBe(10);
    for (const url of csvs) expect(url).toMatch(/\?v=ts-\d+$/);
  });
});
