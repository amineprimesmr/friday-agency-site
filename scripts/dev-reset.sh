#!/usr/bin/env bash
# Réinitialisation locale « hard » : arrêt des serveurs Next, purge des caches, deps OK.
# Usage : bash scripts/dev-reset.sh     ou    npm run reset:dev

set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

# Inclure 3002+ — `next dev` bascule sur le prochain port libre si 3000 est pris par un vieux PID.
PORTS=(3000 3001 3002 3003 3010 3011 3020 3030 3031 3080)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TRACKAPP — reset dev (stop + clean + npm install)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "→ Arrêt des process sur les ports Next habituels..."
for port in "${PORTS[@]}"; do
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [[ -n "${pids:-}" ]]; then
    echo "   Port $port → kill $pids"
    kill -9 $pids 2>/dev/null || true
  fi
done

echo "→ Arrêt des processus next dev / next start..."
pkill -f "[n]ext dev" 2>/dev/null || true
pkill -f "[n]ext start" 2>/dev/null || true
sleep 0.6

echo "→ Suppression des caches (.next, node_modules/.cache, .turbo)..."
rm -rf .next node_modules/.cache .turbo

echo "→ npm install (vérifie / répare node_modules)..."
npm install

echo ""
echo "✓ Reset terminé."
echo "  Puis : npm run dev     — puis ouvre http://127.0.0.1:3000"
echo "  Ou  : npm run dev:open — démarre et ouvre le navigateur (défaut /tracker)"
echo "  Variante rapide : npm run dev:turbo   (Turbopack — peut crasher en longue session)"
echo ""
