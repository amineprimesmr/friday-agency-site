#!/usr/bin/env node
/**
 * Affiche l’URL du Tracker en dev (évite la confusion ERR_CONNECTION_REFUSED
 * quand le navigateur est ouvert sans `npm run dev:tracker`).
 */
const port = process.argv[2] ?? process.env.TRACKER_DEV_PORT ?? "3001";
const url = `http://127.0.0.1:${port}/tracker`;
// eslint-disable-next-line no-console -- script CLI
console.log(`
\x1b[1m\x1b[36mTrackapp — dev Tracker\x1b[0m
  \x1b[32m→\x1b[0m  ${url}
  Si Chrome affiche « connexion refusée », le serveur n’est pas démarré :
  laisse ce terminal ouvert ou relance : \x1b[33mnpm run dev:tracker\x1b[0m
`);
