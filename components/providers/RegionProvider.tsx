"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_REGION,
  REGION_COOKIE,
  regions,
  type Region,
  type RegionId,
} from "@/content/regions";

type RegionContextValue = {
  region: Region;
  setRegion: (id: RegionId) => void;
  /** True once the cookie has been read on the client. */
  hydrated: boolean;
};

const RegionContext = createContext<RegionContextValue | null>(null);

function readCookie(): RegionId | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REGION_COOKIE}=(egypt|uae)`),
  );
  return match ? (match[1] as RegionId) : null;
}

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [regionId, setRegionId] = useState<RegionId>(DEFAULT_REGION);
  const [hydrated, setHydrated] = useState(false);

  // Cookie is read client-side so the whole tree stays statically rendered.
  useEffect(() => {
    const saved = readCookie();
    if (saved) setRegionId(saved);
    setHydrated(true);
  }, []);

  const setRegion = useCallback((id: RegionId) => {
    setRegionId(id);
    document.cookie = `${REGION_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return (
    <RegionContext.Provider
      value={{ region: regions[regionId], setRegion, hydrated }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used inside <RegionProvider>");
  return ctx;
}
