"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Config, DividendAsset } from "@divvy/shared";
import { api } from "./api";

type Ctx = { config: Config; refresh: () => Promise<Config | null> };
const Ctx = createContext<Ctx | null>(null);

/**
 * The site's config, as the server rendered it, and a way to read it again. A page left open keeps the
 * config it loaded with; the create page reads it again (the launch fee can change, as it did on
 * 2026-11-02, and a create checked against an old fee would be stopped as unsafe).
 */
export function ConfigProvider({ value, children }: { value: Config; children: ReactNode }) {
  const [config, setConfig] = useState(value);
  // A new server render wins over what the browser read since.
  useEffect(() => setConfig(value), [value]);
  const refresh = useCallback(async () => {
    try {
      const c = await api<Config>("/api/config");
      setConfig(c);
      return c;
    } catch {
      return null;
    }
  }, []);
  const ctx = useMemo(() => ({ config, refresh }), [config, refresh]);
  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useConfig(): Config {
  const c = useContext(Ctx);
  if (!c) throw new Error("ConfigProvider missing");
  return c.config;
}

/** Reads the config again from the API; the new one replaces it everywhere. Null when the API didn't answer. */
export function useRefreshConfig(): () => Promise<Config | null> {
  const c = useContext(Ctx);
  if (!c) throw new Error("ConfigProvider missing");
  return c.refresh;
}

export function useAssets(): Record<string, DividendAsset> {
  const c = useConfig();
  return Object.fromEntries(c.dividendAssets.map((a) => [a.symbol, a]));
}
