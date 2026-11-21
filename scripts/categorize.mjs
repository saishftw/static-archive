// Assigns a short category to each report with a small model (omp CLI).
// Precedence: <meta name="category"> in the report > cached value > model call.
// The cache (categories.json) is keyed by a hash of title + description, so the
// model only runs for new or changed reports. A model failure never fails the build.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const MODEL = process.env.ARCHIVE_CATEGORY_MODEL || 'github-copilot/claude-haiku-5.5';
const MAX_LEN = 28;

const keyOf = (r) =>
  createHash('sha1').update(`${r.title}\n${r.description}`).digest('hex').slice(0, 12);

export function cleanCategory(raw) {
  const line = String(raw ?? '').split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  const c = line.replace(/^["'`*#\s]+|["'`*.\s]+$/g, '').replace(/\s+/g, ' ');
  if (!c || c.length > MAX_LEN || /[<>{}\[\]]/.test(c)) return '';
  return c;
}

function ask(report, existing) {
  const prompt = [
    'Assign ONE category to this research report for an archive index.',
    'Rules: 1-3 words, Title Case, a topic area (not a document type like "Report").',
    existing.length
      ? `Reuse one of these existing categories if it fits: ${existing.join(', ')}. Only invent a new one if none fits.`
      : 'No categories exist yet; invent a broad, reusable one.',
    'Reply with the category only, nothing else.',
    '',
    `Title: ${report.title}`,
    `Description: ${report.description || '(none)'}`,
  ].join('\n');
  const out = execFileSync('omp', [
    '-p', '--no-session', '--no-tools', '--no-skills', '--no-rules', '--no-context-files',
    '--no-extensions', '--no-lsp', '--no-title', '--model', MODEL, '--thinking', 'off', prompt,
  ], { encoding: 'utf8', timeout: 60_000, stdio: ['ignore', 'pipe', 'pipe'] });
  return cleanCategory(out);
}

export function categorize(reports, root) {
  const file = join(root, 'categories.json');
  const cache = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const next = {};
  const offline = process.env.ARCHIVE_NO_AI === '1';

  for (const r of reports) {
    const key = keyOf(r);
    const hit = cache[r.slug];
    if (r.metaCategory) { r.category = r.metaCategory; continue; }
    if (hit && hit.key === key) { r.category = hit.category; next[r.slug] = hit; continue; }
    // New or changed: ask the model, reusing categories already in use.
    const existing = [...new Set([...reports, ...Object.values(next)].map((x) => x.category).filter(Boolean))].sort();
    let category = '';
    if (!offline) {
      try { category = ask(r, existing); }
      catch (e) { console.warn(`categorize: ${r.slug}: ${String(e.message).split('\n')[0]}`); }
    }
    if (category) {
      r.category = category;
      next[r.slug] = { category, key };
    } else {
      // Keep a stale value for display, but do not cache it so the next build retries.
      r.category = hit?.category ?? '';
    }
  }
  const out = JSON.stringify(Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n';
  if (!existsSync(file) || readFileSync(file, 'utf8') !== out) writeFileSync(file, out);
}
