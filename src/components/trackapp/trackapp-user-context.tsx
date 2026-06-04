"use client";

import { createContext, useContext } from "react";

export type TrackappUserContextValue = Readonly<{
  loggedIn: boolean;
  email?: string;
  signOutHref: string;
}>;

const TrackappUserContext = createContext<TrackappUserContextValue | null>(null);

export function TrackappUserProvider({
  children,
  loggedIn,
  email,
  signOutHref,
}: TrackappUserContextValue & { children: React.ReactNode }) {
  return (
    <TrackappUserContext.Provider value={{ loggedIn, email, signOutHref }}>
      {children}
    </TrackappUserContext.Provider>
  );
}

export function useTrackappUser(): TrackappUserContextValue {
  const ctx = useContext(TrackappUserContext);
  if (!ctx) {
    return { loggedIn: false, email: undefined, signOutHref: "/trackapp/deconnexion" };
  }
  return ctx;
}
