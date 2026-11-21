// Builds the archive index: node scripts/build.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectReports } from './collect.mjs';
import { categorize } from './categorize.mjs';
import { render } from './render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reports = collectReports(root);
categorize(reports, root);
writeFileSync(join(root, 'index.html'), render(reports));
console.log(`index.html: ${reports.length} report(s)`);
