"use client";

import { useState, useEffect } from "react";
import { addToWatchlist, isInWatchlist } from "./watchlist";

interface Props {
  id: string;
  name: string;
  artworkUrl: string;
  category: string;
}

export function WatchButton({ id, name, artworkUrl, category }: Props) {
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    setWatching(isInWatchlist(id));
  }, [id]);

  function toggle() {
    if (watching) {
      try {
        const key = "friday_watchlist";
        const current = JSON.parse(localStorage.getItem(key) ?? "[]") as {
          id: string;
        }[];
        localStorage.setItem(
          key,
          JSON.stringify(current.filter((a) => a.id !== id)),
        );
      } catch {
        // ignore
      }
      setWatching(false);
    } else {
      addToWatchlist({ id, name, artworkUrl, category });
      setWatching(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`tracker-touch rounded-xl px-4 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow,border-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        watching
          ? "bg-white/12 text-white ring-1 ring-white/20 hover:bg-rose-500/15 hover:text-rose-200 hover:ring-rose-400/30"
          : "bg-white/[0.08] text-white/75 hover:bg-white/[0.14] hover:text-white"
      }`}
    >
      {watching ? "★ Suivi" : "☆ Suivre"}
    </button>
  );
}
