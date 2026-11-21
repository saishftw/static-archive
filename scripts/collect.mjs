// Scans top-level *.html files (except index.html) and returns report metadata.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const SKIP = new Set(['index.html']);

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim();

// Reports embed large base64 fonts, so read the <head> and a short visible-text excerpt only.
function readParts(file) {
  const html = readFileSync(file, 'utf8');
  const end = html.search(/<\/head>/i);
  const head = end === -1 ? html.slice(0, 20000) : html.slice(0, end);
  const excerpt = decode(
    html.slice(end === -1 ? 0 : end)
      .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).slice(0, 700);
  return { head, excerpt };
}

function meta(head, name) {
  const re = new RegExp(
    `<meta\\s+[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const alt = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i');
  const m = head.match(re) || head.match(alt);
  return m ? decode(m[1]) : '';
}

function gitDate(file, root) {
  try {
    const out = execFileSync('git', ['log', '--diff-filter=A', '--follow', '--format=%cI', '--', file],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split('\n').filter(Boolean);
    return out.at(-1) || '';
  } catch { return ''; }
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "…, 18 Nov 2026" at the end of a title -> "2026-11-18"
function titleDate(title) {
  const m = /(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})\s*$/.exec(title);
  const mo = m ? MONTHS.indexOf(m[2].toLowerCase()) : -1;
  return mo < 0 ? '' : `${m[3]}-${String(mo + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

export function collectReports(root) {
  const reports = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.html$/i.test(entry.name) || entry.name.startsWith('.') || SKIP.has(entry.name)) continue;
    const rel = entry.name;
    const slug = rel.replace(/\.html$/i, '');
    const file = join(root, rel);
    const { head, excerpt } = readParts(file);
    const t = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = t ? decode(t[1]) : slug;
    const date = meta(head, 'date') || meta(head, 'article:published_time') || titleDate(title)
      || gitDate(rel, root) || statSync(file).mtime.toISOString();
    reports.push({
      slug,
      href: rel,
      title,
      description: meta(head, 'description') || meta(head, 'og:description'),
      metaCategory: meta(head, 'category'),
      excerpt,
      date: date.slice(0, 10),
      sizeKb: Math.round(statSync(file).size / 1024),
    });
  }
  return reports.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
