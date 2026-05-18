// ══════════════════════════════════════════════════════════════
//  Trackapp App Tracker — Widget Scriptable
//  Aperçu téléchargements & revenus (source agrégée publique)
//  frid4y.agency/tracker
//
//  ► Tailles : small (1 app) · medium (4 apps) · large (8 apps)
//  ► Paramètre widget : nom d'app pour mode focus (ex: "Instagram")
// ══════════════════════════════════════════════════════════════

const TRACKER   = "https://frid4y.agency/tracker";
const COUNTRY   = "fr";
const RSS_LIMIT = { small: 1, medium: 4, large: 8 };

// ─── Palette ─────────────────────────────────────────────────
const C = {
  bg:      new Color("#07070f"),
  card:    new Color("#0d0d1a"),
  cyan:    new Color("#22d3ee"),
  violet:  new Color("#a78bfa"),
  emerald: new Color("#34d399"),
  amber:   new Color("#fbbf24"),
  red:     new Color("#f87171"),
  white:   Color.white(),
  w70:     new Color("#ffffffb3"),
  w50:     new Color("#ffffff80"),
  w35:     new Color("#ffffff59"),
  w20:     new Color("#ffffff33"),
  w10:     new Color("#ffffff1a"),
  w06:     new Color("#ffffff0f"),
  cyanBg:  new Color("#22d3ee18"),
  violetBg:new Color("#a78bfa18"),
  emeraldBg:new Color("#34d39918"),
};

// ─── Helpers réseau ──────────────────────────────────────────
async function fetchJSON(url) {
  try {
    const req = new Request(url);
    req.headers = { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" };
    return await req.loadJSON();
  } catch { return null; }
}

async function fetchImg(url) {
  try { return await new Request(url).loadImage(); }
  catch { return null; }
}

function fmtST(s) {
  if (!s || s === "—") return "—";
  return s.replace(/([kmbt])$/, m => m.toUpperCase());
}

// ─── API calls ───────────────────────────────────────────────
async function getTopApps(limit) {
  const data = await fetchJSON(
    `https://rss.marketingtools.apple.com/api/v2/${COUNTRY}/apps/top-free/${Math.min(limit, 100)}/apps.json`
  );
  return (data?.feed?.results ?? []).slice(0, limit).map((a, i) => ({
    id: a.id, name: a.name, artist: a.artistName,
    artwork: a.artworkUrl100, rank: i + 1,
  }));
}

async function searchOneApp(query) {
  const data = await fetchJSON(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=3&country=${COUNTRY}`
  );
  const a = data?.results?.[0];
  if (!a) return null;
  return {
    id: String(a.trackId), name: a.trackName, artist: a.artistName,
    artwork: a.artworkUrl512 || a.artworkUrl100, rank: 0,
    rating: a.averageUserRating ?? 0, ratingCount: a.userRatingCount ?? 0,
    price: a.price ?? 0, category: a.primaryGenreName ?? "",
    version: a.version ?? "", size: Number(a.fileSizeBytes ?? 0),
  };
}

async function getPublicAppMetrics(ids) {
  const data = await fetchJSON(
    `https://app.sensortower.com/api/ios/apps?app_ids=${ids.join(",")}`
  );
  const map = {};
  for (const a of (data?.apps ?? [])) {
    const dl  = a.humanized_worldwide_last_month_downloads;
    const rev = a.humanized_worldwide_last_month_revenue;
    map[String(a.app_id)] = {
      dl:     fmtST(dl?.string),
      rev:    fmtST(rev?.string),
      dlNum:  dl?.downloads  ?? 0,
      revNum: rev?.revenue   ?? 0,
      rating: a.rating       ?? 0,
      globalRatings: a.global_rating_count ?? 0,
    };
  }
  return map;
}

// ─── UI helpers ───────────────────────────────────────────────
function pill(parent, text, textColor, bgColor, fontSize = 9) {
  const s = parent.addStack();
  s.backgroundColor = bgColor;
  s.cornerRadius = 6;
  s.setPadding(3, 7, 3, 7);
  const t = s.addText(text);
  t.font = Font.boldSystemFont(fontSize);
  t.textColor = textColor;
  return s;
}

function label(parent, text, font, color, lines = 1) {
  const t = parent.addText(text);
  t.font = font;
  t.textColor = color;
  t.lineLimit = lines;
  t.minimumScaleFactor = 0.75;
  return t;
}

function hLine(parent) {
  const s = parent.addStack();
  s.backgroundColor = C.w10;
  s.size = new Size(-1, 0.5);
}

// ─── Header commun ───────────────────────────────────────────
function buildHeader(widget, subtitle) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  // Logo pill
  const logo = row.addStack();
  logo.layoutHorizontally();
  logo.centerAlignContent();
  logo.backgroundColor = C.cyanBg;
  logo.cornerRadius = 8;
  logo.setPadding(4, 8, 4, 8);
  label(logo, "◆ ", Font.boldSystemFont(9), C.cyan);
  label(logo, "Trackapp", Font.boldSystemFont(9), C.cyan);

  row.addSpacer(10);

  const titles = row.addStack();
  titles.layoutVertically();
  label(titles, "App Tracker", Font.boldSystemFont(13), C.white);
  label(titles, subtitle, Font.systemFont(9), C.w35);

  row.addSpacer();

  // Live badge
  pill(row, "⬤ LIVE", C.emerald, C.emeraldBg, 8);
}

// ─── Footer CTA ──────────────────────────────────────────────
function buildFooter(widget) {
  hLine(widget);
  widget.addSpacer(6);
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  label(row, "frid4y.agency", Font.systemFont(8), C.w20);
  row.addSpacer();

  const cta = row.addStack();
  cta.layoutHorizontally();
  cta.centerAlignContent();
  cta.backgroundColor = C.cyanBg;
  cta.cornerRadius = 8;
  cta.setPadding(5, 10, 5, 10);
  label(cta, "Ouvrir App Tracker  →", Font.boldSystemFont(9), C.cyan);
}

// ─── Ligne app (dashboard) ───────────────────────────────────
async function buildAppRow(parent, app, st, compact = false) {
  const row = parent.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  // Rang
  const rankBox = row.addStack();
  rankBox.size = new Size(22, 28);
  rankBox.centerAlignContent();
  const rankT = rankBox.addText(`#${app.rank}`);
  rankT.font = Font.boldSystemFont(10);
  rankT.textColor = app.rank === 1 ? C.amber : app.rank <= 3 ? C.w70 : C.w35;
  rankT.minimumScaleFactor = 0.7;

  // Icône
  const img = app.artwork ? await fetchImg(app.artwork) : null;
  if (img) {
    const icon = row.addImage(img);
    icon.imageSize = new Size(28, 28);
    icon.cornerRadius = 6;
  } else {
    const ph = row.addStack();
    ph.size = new Size(28, 28);
    ph.backgroundColor = C.w10;
    ph.cornerRadius = 6;
  }

  row.addSpacer(8);

  // Infos
  const info = row.addStack();
  info.layoutVertically();
  info.spacing = 1;

  label(info, app.name.length > 22 ? app.name.slice(0, 21) + "…" : app.name,
    Font.mediumSystemFont(compact ? 10 : 11), C.white);

  if (st) {
    const metrics = info.addStack();
    metrics.layoutHorizontally();
    metrics.centerAlignContent();
    label(metrics, `↓ ${st.dl}`, Font.systemFont(9), C.violet);
    metrics.addSpacer(6);
    label(metrics, `${st.rev}`, Font.systemFont(9), C.emerald);
  } else {
    label(info, app.artist.length > 24 ? app.artist.slice(0, 23) + "…" : app.artist,
      Font.systemFont(9), C.w35);
  }

  row.addSpacer();
}

// ─── Mode focus (1 app) ──────────────────────────────────────
async function buildSingleApp(widget, query) {
  const app = await searchOneApp(query);
  if (!app) {
    label(widget, "App introuvable", Font.systemFont(12), C.w35);
    return;
  }
  const stMap = await getPublicAppMetrics([app.id]);
  const st    = stMap[app.id];
  widget.url  = `${TRACKER}/apps/${app.id}?country=${COUNTRY}`;

  // Icon
  const img = await fetchImg(app.artwork);
  if (img) {
    const icon = widget.addImage(img);
    icon.imageSize = new Size(52, 52);
    icon.cornerRadius = 12;
  }

  widget.addSpacer(6);

  const nameT = widget.addText(app.name);
  nameT.font  = Font.boldSystemFont(13);
  nameT.textColor = C.white;
  nameT.lineLimit = 2;
  nameT.minimumScaleFactor = 0.8;

  const devT  = widget.addText(app.artist);
  devT.font   = Font.systemFont(9);
  devT.textColor = C.w35;
  devT.lineLimit = 1;

  widget.addSpacer(8);

  if (st) {
    const dlRow = widget.addStack();
    dlRow.layoutHorizontally();
    dlRow.centerAlignContent();
    label(dlRow, "↓ ", Font.systemFont(9), C.w35);
    label(dlRow, st.dl, Font.boldSystemFont(13), C.violet);
    label(dlRow, "/mois", Font.systemFont(9), C.w35);

    widget.addSpacer(3);

    const revRow = widget.addStack();
    revRow.layoutHorizontally();
    revRow.centerAlignContent();
    label(revRow, "$ ", Font.systemFont(9), C.w35);
    label(revRow, st.rev, Font.boldSystemFont(13), C.emerald);
    label(revRow, "/mois", Font.systemFont(9), C.w35);
  }

  widget.addSpacer();

  const cta = widget.addStack();
  cta.layoutHorizontally();
  cta.centerAlignContent();
  cta.backgroundColor = C.cyanBg;
  cta.cornerRadius = 8;
  cta.setPadding(5, 10, 5, 10);
  label(cta, "App Tracker  →", Font.boldSystemFont(9), C.cyan);
}

// ─── Mode dashboard ──────────────────────────────────────────
async function buildDashboard(widget, limit, family) {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  buildHeader(widget, `🇺🇸 Top ${limit} Gratuit · ${dateStr}`);
  widget.addSpacer(8);
  hLine(widget);
  widget.addSpacer(family === "medium" ? 5 : 4);

  const apps  = await getTopApps(limit);
  const stMap = apps.length > 0 ? await getPublicAppMetrics(apps.map(a => a.id)) : {};

  const compact = family === "large" && limit > 6;

  for (let i = 0; i < apps.length; i++) {
    await buildAppRow(widget, apps[i], stMap[apps[i].id], compact);
    if (i < apps.length - 1) widget.addSpacer(compact ? 3 : 5);
  }

  widget.addSpacer();
  buildFooter(widget);
}

// ─── Entry point ─────────────────────────────────────────────
const param  = args.widgetParameter?.trim() ?? "";
const family = config.widgetFamily ?? "medium";
const limit  = RSS_LIMIT[family] ?? 4;

const widget = new ListWidget();
widget.backgroundColor = C.bg;
widget.url = TRACKER;
widget.setPadding(14, 14, 14, 14);
widget.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000); // 1h

if (family === "small" && param) {
  await buildSingleApp(widget, param);
} else {
  await buildDashboard(widget, limit, family);
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  const preview = { small: "Small", medium: "Medium", large: "Large" }[family] ?? "Medium";
  await widget[`present${preview}`]();
}

Script.complete();
