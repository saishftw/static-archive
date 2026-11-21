// Renders the archive landing page: render(reports) => full HTML document.
// Output is deterministic: it depends only on `reports`.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

// Show the search field only when the list is long enough to need it.
const SEARCH_MIN = 5;
// Cap the entrance stagger so long lists do not trail.
const STAGGER_MAX = 12;

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\s+/g, ' ').trim();

const href = (r) => String(r.href || `${r.slug}/`).split('/').map(encodeURIComponent).join('/');

function parseDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return null;
  const mo = Number(m[2]) - 1;
  if (mo < 0 || mo > 11) return null;
  const d = Number(m[3]);
  return { iso, year: m[1], short: `${d} ${MONTHS[mo]}`, full: `${d} ${MONTHS_LONG[mo]} ${m[1]}`, display: `${d} ${MONTHS[mo]} ${m[1]}` };
}

// "Topic: validation report, 18 Nov 2026" -> { topic: "Topic", kind: "Validation report" }
const MONTH_RE = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?';
const DATE_TAIL = new RegExp(
  `[\\s,;:(–—-]*(?:\\d{1,2}(?:st|nd|rd|th)?\\s+${MONTH_RE},?\\s+\\d{4}|${MONTH_RE}\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}|${MONTH_RE}\\s+\\d{4}|\\d{4}-\\d{2}-\\d{2})\\)?\\s*$`, 'i');
const KIND_RE = /\b(report|review|study|analysis|brief|memo|audit|teardown|notes?|survey|research|assessment|deep dive)\b/i;
const SEP_RE = /\s*:\s+|\s+[—–|-]\s+/g;

export function splitTitle(title, slug = '') {
  const raw = String(title || '').trim();
  const rest = raw.replace(DATE_TAIL, '').trim();
  let topic = rest;
  let kind = '';
  let last = null;
  for (const m of rest.matchAll(SEP_RE)) last = m;
  if (last) {
    const before = rest.slice(0, last.index).trim();
    const after = rest.slice(last.index + last[0].length).trim();
    if (before && after && after.length <= 48 && KIND_RE.test(after)) {
      topic = before;
      kind = after.charAt(0).toUpperCase() + after.slice(1);
    }
  }
  if (!topic) topic = raw || String(slug).replace(/[-_]+/g, ' ');
  return { topic, kind };
}

const fmtSize = (kb) => {
  const n = Number(kb);
  if (!Number.isFinite(n) || n <= 0) return '';
  return n >= 1024 ? `${(n / 1024).toFixed(1)} MB` : `${Math.round(n)} KB`;
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const ICON = {
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  search: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M10 6h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H10L4 16z" fill="#9c3f19"/><circle cx="11" cy="16" r="2" fill="#f7f4ee"/></svg>');

const LIGHT = `--bg:#f7f4ee;--card:#fdfbf7;--raised:#efe9df;--sunk:#e8e0d2;
  --ink:#1f1b16;--ink2:#564d42;--ink3:#6a6156;
  --line:rgba(31,27,22,.12);--line2:rgba(31,27,22,.2);
  --accent:#9c3f19;--focus:#9c3f19;--sel:rgba(156,63,25,.18);
  --tag-bg:#e6e1d8;--tag:#463e34;--bar:rgba(247,244,238,.86);`;
const DARK = `--bg:#161513;--card:#1c1a18;--raised:#24221f;--sunk:#2c2926;
  --ink:#efe9de;--ink2:#bdb5a8;--ink3:#9d958a;
  --line:rgba(239,233,222,.1);--line2:rgba(239,233,222,.18);
  --accent:#ec9467;--focus:#ec9467;--sel:rgba(236,148,103,.28);
  --tag-bg:#2c2925;--tag:#cfc6b8;--bar:rgba(22,21,19,.86);`;

const CSS = `
:root{
  --sans:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --serif:"Newsreader","Iowan Old Style","Charter","Source Serif 4","Source Serif Pro",Georgia,ui-serif,serif;
  --ease:cubic-bezier(0.23,1,0.32,1);
  --pad:20px;--c1:0px;--c2:0px;--c4:0px;--bar-h:0px;
  color-scheme:light;
  ${LIGHT}
}
html[data-theme=dark]{color-scheme:dark;${DARK}}
@media (prefers-color-scheme:dark){html:not([data-theme]){color-scheme:dark;${DARK}}}
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%;scrollbar-color:var(--line2) transparent}
html:has(body.has-bar){scroll-padding-top:96px}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.6 var(--sans);text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;caret-color:var(--accent)}
::selection{background:var(--sel);color:var(--ink)}
a{color:inherit;text-decoration-thickness:1px;text-underline-offset:3px;text-decoration-color:var(--line2)}
:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
a:focus-visible{border-radius:4px}
svg{display:block}
.vh{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;left:12px;top:-60px;z-index:30;background:var(--ink);color:var(--bg);padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:500}
.skip:focus{top:12px}
.wrap{max-width:1240px;margin:0 auto;padding:0 var(--pad)}
.tnum{font-variant-numeric:tabular-nums lining-nums}

/* masthead */
.top{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px;padding-top:16px;color:var(--ink3);font-size:.875rem}
.top p{margin:0}
.theme{flex:none;display:none;align-items:center;justify-content:center;gap:8px;min-width:44px;height:44px;padding:0 12px;border-radius:10px;border:1px solid var(--line2);background:var(--card);color:var(--ink);font:500 .875rem var(--sans);cursor:pointer;transition:background-color .16s var(--ease),transform .16s var(--ease)}
html.js .theme{display:inline-flex}
.theme svg{width:18px;height:18px}
.theme .lbl{display:none}
.theme:active{transform:scale(.97)}
.mast{padding-bottom:40px}
h1{font:500 clamp(2.75rem,1.4rem + 4.6vw,5.75rem)/.98 var(--serif);letter-spacing:-.025em;margin:48px 0 0;text-wrap:balance;font-optical-sizing:auto}
.lede{margin:20px 0 0;max-width:44ch;font-size:1.0625rem;line-height:1.55;color:var(--ink2);text-wrap:pretty}

/* search bar */
.bar{display:none}
html.js .bar{display:block;position:sticky;top:0;z-index:10;background:var(--bar);-webkit-backdrop-filter:saturate(1.2) blur(12px);backdrop-filter:saturate(1.2) blur(12px);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.bar .wrap{display:flex;align-items:center;gap:16px;min-height:68px;padding-block:12px}
.field{position:relative;flex:1;max-width:520px}
.field .ico{position:absolute;left:12px;top:50%;width:18px;height:18px;margin-top:-9px;color:var(--ink3);pointer-events:none}
.field input{width:100%;height:44px;margin:0;padding:0 48px 0 40px;border:1px solid var(--line2);border-radius:10px;background:var(--card);color:var(--ink);font:400 1rem var(--sans);-webkit-appearance:none;appearance:none;transition:border-color .16s var(--ease)}
.field input::placeholder{color:var(--ink3);opacity:1}
.field input::-webkit-search-cancel-button,.field input::-webkit-search-decoration{-webkit-appearance:none;appearance:none}
.field input:focus{outline:none;border-color:var(--focus);box-shadow:0 0 0 3px var(--sel)}
.field kbd{position:absolute;right:10px;top:50%;margin-top:-12px;display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border:1px solid var(--line2);border-bottom-width:2px;border-radius:6px;color:var(--ink3);font:500 .75rem/1 var(--sans);pointer-events:none}
.field input:focus ~ kbd,.field input:not(:placeholder-shown) ~ kbd{display:none}
.clear{position:absolute;right:4px;top:50%;margin-top:-18px;display:grid;place-items:center;width:36px;height:36px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--ink2);cursor:pointer;transition:background-color .16s var(--ease),transform .16s var(--ease)}
.clear svg{width:18px;height:18px}
.clear:active{transform:scale(.94)}
.status{margin:0 0 0 auto;color:var(--ink3);font-size:.875rem;white-space:nowrap}

/* category filter: a scroll strip on phones, wrapped buttons from 744px */
.cats{display:none}
html.js .cats{display:block}
.cats-in{position:relative;display:flex;gap:8px;margin:0 calc(var(--pad) * -1);padding:16px var(--pad) 20px;overflow-x:auto;scrollbar-width:none;scroll-padding-inline:var(--pad);--fl:0px;--fr:0px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 var(--fl),#000 calc(100% - var(--fr)),transparent);mask-image:linear-gradient(90deg,transparent,#000 var(--fl),#000 calc(100% - var(--fr)),transparent)}
.cats-in::-webkit-scrollbar{display:none}
.cats-in.fade-l{--fl:24px}
.cats-in.fade-r{--fr:40px}
.chip{flex:none;display:inline-flex;align-items:center;gap:8px;height:36px;margin:0;padding:0 12px;border:1px solid var(--line2);border-radius:10px;background:var(--card);color:var(--ink);font:500 .875rem/1 var(--sans);white-space:nowrap;cursor:pointer;transition:background-color .16s var(--ease),color .16s var(--ease),border-color .16s var(--ease),transform .16s var(--ease)}
.chip .n{color:var(--ink3);font-variant-numeric:tabular-nums}
.chip[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.chip[aria-pressed=true] .n{color:color-mix(in srgb,var(--bg) 68%,var(--ink))}
.chip:active{transform:scale(.97)}
@media (pointer:coarse){.chip{height:40px}}

/* list */
main{padding-bottom:72px}
.year{border-top:1px solid var(--line2)}
html.js .bar + main .year:first-child{border-top-color:transparent}
.nw{white-space:nowrap}
.year-h{margin:0;padding:24px 0 4px;font:400 1.75rem/1 var(--serif);color:var(--ink2);font-variant-numeric:lining-nums tabular-nums}
.entries{list-style:none;margin:0;padding:0;position:relative;z-index:0}
.entry{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"when go" "body body" "meta meta";gap:8px 16px;padding:20px 0 24px;border-top:1px solid var(--line);transition:transform .16s var(--ease),border-color .2s var(--ease)}
.entry:first-child{border-top-color:transparent}
.entry::before{content:"";position:absolute;inset:0 -12px;z-index:-1;border-radius:12px;background:var(--raised);opacity:0;transition:opacity .2s var(--ease),background-color .16s var(--ease)}
.when{grid-area:when;align-self:center;color:var(--ink2);font-size:.875rem;font-weight:500;line-height:1.5}
.body{grid-area:body;min-width:0}
.title{margin:0;font:500 1.5rem/1.2 var(--serif);letter-spacing:-.01em;text-wrap:balance;overflow-wrap:anywhere;font-optical-sizing:auto}
.title a{text-decoration-color:transparent;transition:text-decoration-color .2s var(--ease)}
.title a::after{content:"";position:absolute;inset:0 -12px;border-radius:12px}
.desc{margin:8px 0 0;max-width:64ch;color:var(--ink2);font-size:1rem;line-height:1.55;text-wrap:pretty;overflow-wrap:anywhere}
.meta{grid-area:meta;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:4px;min-width:0}
.facts{display:inline-flex;flex-wrap:wrap;align-items:baseline;gap:0 8px;min-width:0;color:var(--ink3);font-size:.875rem;line-height:1.5}
.facts > * + *::before{content:"\\00b7";margin-right:8px}
.cat{color:var(--ink2);overflow-wrap:anywhere}
.go{grid-area:go;align-self:center;color:var(--ink3);transition:color .2s var(--ease),transform .2s var(--ease)}
.go svg{width:20px;height:20px}
.entry:active{transform:scale(.995)}
.entry:active::before{opacity:1;background:var(--sunk)}
@supports selector(:has(*)){
  .title a:focus-visible{outline:none}
  .entry:has(.title a:focus-visible)::before{opacity:1;outline:2px solid var(--focus);outline-offset:0}
}

/* hang tag, from the reports */
.kind{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-height:22px;padding:4px 8px 4px 10px;border-radius:3px 4px 4px 3px;clip-path:polygon(6px 0,100% 0,100% 100%,6px 100%,0 50%);background:var(--tag-bg);color:var(--tag);font:500 .75rem/1.2 var(--sans)}
.kind::before{content:"";flex:none;width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.55}

/* lead: the newest report */
.lead{padding:28px 0 40px}
.lead .title{font-size:clamp(2rem,1.3rem + 2.4vw,3.25rem);line-height:1.06;letter-spacing:-.02em}
.lead .desc{margin-top:16px;font-size:1.125rem;max-width:56ch}
.filtering .lead{padding:20px 0 24px}
.filtering .lead .title{font-size:1.5rem;line-height:1.2;letter-spacing:-.01em}
.filtering .lead .desc{margin-top:8px;font-size:1rem}

/* states */
.none,.empty{padding:48px 0 24px}
.empty{border-top:1px solid var(--line2)}
body:not(.has-cats) .filtering .year.is-first,.filtering .entry.is-first{border-top-color:transparent}
.none p,.empty p{margin:0;color:var(--ink2);max-width:52ch}
.empty h2{margin:0 0 8px;font:500 1.75rem/1.2 var(--serif)}
.none q{color:var(--ink)}
.btn{display:inline-flex;align-items:center;min-height:44px;margin-top:16px;padding:0 16px;border-radius:10px;border:1px solid var(--line2);background:var(--card);color:var(--ink);font:500 .9375rem var(--sans);cursor:pointer;transition:background-color .16s var(--ease),transform .16s var(--ease)}
.btn:active{transform:scale(.97)}
code{font:.9em ui-monospace,"SF Mono",Menlo,Consolas,monospace;background:var(--raised);padding:2px 6px;border-radius:4px}

.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 24px;padding:24px 0 48px;border-top:1px solid var(--line2);color:var(--ink3);font-size:.875rem}
.foot p{margin:0}
.foot a{text-decoration-color:var(--line2)}

@media (min-width:744px){
  :root{--pad:40px;--c2:96px;--c4:184px}
  .top{padding-top:24px}
  .theme .lbl{display:inline}
  .mast{padding-bottom:56px}
  h1{margin-top:72px}
  .lede{margin-left:var(--c2);font-size:1.125rem}
  .bar .field,.cats-in{margin-left:var(--c2)}
  .cats-in{flex-wrap:wrap;margin-right:0;padding:20px 0 24px;overflow:visible;-webkit-mask-image:none;mask-image:none}
  .entry{grid-template-columns:var(--c2) minmax(0,1fr) var(--c4) 24px;grid-template-areas:"when body meta go";gap:0}
  .when{align-self:start;padding-top:6px}
  .body{padding-right:32px}
  .meta{flex-direction:column;align-items:flex-start;gap:8px;margin-top:6px;padding-right:16px}
  .go{align-self:start;margin-top:6px}
  .title{font-size:1.625rem}
  .lead .when,.lead .meta,.lead .go{padding-top:0;margin-top:14px}
  .filtering .lead .when{margin-top:0;padding-top:6px}
  .filtering .lead .meta,.filtering .lead .go{margin-top:6px}
  .filtering .lead .title{font-size:1.625rem}
  .none,.empty{padding-left:var(--c2)}
}
@media (min-width:1100px){
  :root{--c1:168px;--c2:104px}
  html.js body.has-bar{--bar-h:70px}
  .lede,.bar .field,.cats-in{margin-left:calc(var(--c1) + var(--c2))}
  .none,.empty{margin-left:var(--c1)}
  .year{display:grid;grid-template-columns:var(--c1) minmax(0,1fr)}
  .year-h{position:sticky;top:calc(var(--bar-h) + 24px);align-self:start;padding:28px 0;font-size:2rem}
  .year .entries{grid-column:2}
}
@media (hover:hover) and (pointer:fine){
  .theme:hover,.btn:hover,.chip:not([aria-pressed=true]):hover{background:var(--raised)}
  .clear:hover{background:var(--raised)}
  .entry:hover::before{opacity:1}
  .entry:hover,.entry:hover + .entry{border-top-color:transparent}
  .entry:hover .title a{text-decoration-color:var(--line2)}
  .entry:hover .go{color:var(--accent);transform:translateX(3px)}
  footer a:hover{text-decoration-color:currentColor}
}
@media (hover:none){.field kbd{display:none}}
@media (prefers-reduced-motion:no-preference){
  html.intro .entry{animation:rise .56s var(--ease) both;animation-delay:calc(var(--i,0) * 40ms + 40ms)}
  @keyframes rise{from{opacity:0;transform:translateY(8px)}}
}
@media (prefers-reduced-motion:reduce){
  .entry,.go,.theme,.btn,.clear,.chip{transition-property:opacity,background-color,color,border-color,text-decoration-color}
  .entry:active,.theme:active,.btn:active,.clear:active,.chip:active{transform:none}
  .entry:hover .go{transform:none}
}
@media print{
  .bar,.cats,.theme,.go,.skip{display:none!important}
  .entry{break-inside:avoid}
}
`;

// Runs before paint: same theme logic and storage key as the reports.
const HEAD_JS = `(function(){var r=document.documentElement;r.classList.add('js');try{var s=localStorage.getItem('wr-theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=d?'dark':'light';}catch(e){r.dataset.theme='light';}try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('intro');}catch(e){}})();`;

const BODY_JS = `(function(){
var root=document.documentElement;
var endIntro=function(){root.classList.remove('intro')};
setTimeout(endIntro,1100);
var toggles=[].slice.call(document.querySelectorAll('[data-theme-toggle]'));
function syncTheme(){var d=root.dataset.theme==='dark';toggles.forEach(function(b){b.setAttribute('aria-pressed',d?'true':'false')});}
toggles.forEach(function(b){b.addEventListener('click',function(){root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('wr-theme',root.dataset.theme)}catch(e){}syncTheme();});});
syncTheme();
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){var s=null;try{s=localStorage.getItem('wr-theme')}catch(x){}if(!s){root.dataset.theme=e.matches?'dark':'light';syncTheme();}});}catch(e){}

var q=document.getElementById('q');
var strip=document.getElementById('cats-in');
var chips=strip?[].slice.call(strip.querySelectorAll('.chip')):[];
if(!q&&!chips.length)return;
var main=document.getElementById('main');
var entries=[].slice.call(main.querySelectorAll('.entry'));
var years=[].slice.call(main.querySelectorAll('.year'));
var status=document.getElementById('status');
var none=document.getElementById('none');
var noneQ=document.getElementById('none-q');
var noneIn=document.getElementById('none-in');
var noneClear=document.getElementById('none-clear');
var clear=document.getElementById('clear');
var total=entries.length;
var cat='';
function norm(s){return s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/\\s+/g,' ').trim();}
function chipFor(key){for(var i=0;i<chips.length;i++){if(chips[i].getAttribute('data-c')===key)return chips[i];}return null;}
function visible(){for(var i=0;i<entries.length;i++){if(!entries[i].hidden)return entries[i].querySelector('.title a');}return null;}
function apply(){
  var raw=q?q.value.trim():'';var terms=norm(raw).split(' ').filter(Boolean);var n=0;
  entries.forEach(function(e){var hay=e.getAttribute('data-q');var ok=(!cat||e.getAttribute('data-c')===cat)&&terms.every(function(t){return hay.indexOf(t)!==-1});e.hidden=!ok;if(ok)n++;});
  var firstYear=null;
  entries.forEach(function(e){e.classList.remove('is-first');});
  years.forEach(function(y){var first=y.querySelector('.entry:not([hidden])');y.hidden=!first;if(first){first.classList.add('is-first');if(!firstYear)firstYear=y;}y.classList.toggle('is-first',y===firstYear);});
  var active=terms.length>0||cat!=='';
  main.classList.toggle('filtering',active);
  status.textContent=active?(n+' of '+total):'';
  chips.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-c')===cat?'true':'false');});
  var label=cat?chipFor(cat).getAttribute('data-label'):'';
  if(none){noneQ.textContent=raw;noneIn.textContent=label?' in '+label:'';noneClear.textContent=label?'Clear filters':'Clear search';none.hidden=n>0;}
  if(clear)clear.hidden=!q.value;
  try{var u=new URL(location.href);if(raw)u.searchParams.set('q',raw);else u.searchParams.delete('q');if(label)u.searchParams.set('c',label);else u.searchParams.delete('c');history.replaceState(null,'',u.href);}catch(e){}
}
function fades(){if(!strip)return;var max=strip.scrollWidth-strip.clientWidth;strip.classList.toggle('fade-l',strip.scrollLeft>2);strip.classList.toggle('fade-r',strip.scrollLeft<max-2);}
chips.forEach(function(b){b.addEventListener('click',function(){endIntro();cat=b.getAttribute('data-c');apply();});});
if(strip){strip.addEventListener('scroll',fades,{passive:true});addEventListener('resize',fades);fades();}
if(q){
  q.addEventListener('input',function(){endIntro();apply();});
  q.addEventListener('keydown',function(e){
    if(e.key==='Escape'){if(q.value){q.value='';apply();}else{q.blur();}e.preventDefault();}
    else if(e.key==='Enter'){var a=visible();if(a){e.preventDefault();location.href=a.href;}}
    else if(e.key==='ArrowDown'){var b=visible();if(b){e.preventDefault();b.focus();}}
  });
  clear.addEventListener('click',function(){q.value='';apply();q.focus();});
  document.addEventListener('keydown',function(e){
    if(e.key!=='/'||e.metaKey||e.ctrlKey||e.altKey||e.defaultPrevented)return;
    var t=e.target;var tag=t&&t.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    e.preventDefault();q.focus();q.select();
  });
}
if(noneClear)noneClear.addEventListener('click',function(){cat='';if(q){q.value='';}apply();if(q)q.focus();});
try{
  var params=new URL(location.href).searchParams;var iq=q?(params.get('q')||''):'';var ic=norm(params.get('c')||'');
  var c=ic?chipFor(ic):null;
  if(iq||c){endIntro();if(q)q.value=iq;cat=c?ic:'';apply();}
  if(c&&strip){strip.scrollLeft=Math.max(0,c.offsetLeft-strip.clientWidth/2+c.offsetWidth/2);fades();}
}catch(e){}
})();`;

const catLabel = (r) => String(r.category ?? '').replace(/\s+/g, ' ').trim();

// Distinct categories, keyed like the client-side filter: count desc, then name.
function categoriesOf(list) {
  const map = new Map();
  for (const r of list) {
    const label = catLabel(r);
    if (!label) continue;
    const key = norm(label);
    const c = map.get(key);
    if (c) c.count++;
    else map.set(key, { key, label, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

function entryHtml(r, i) {
  const { topic, kind } = splitTitle(r.title, r.slug);
  const d = parseDate(r.date);
  const size = fmtSize(r.sizeKb);
  const cat = catLabel(r);
  const desc = String(r.description || '').trim();
  const hay = norm([topic, kind, cat, desc, r.slug, d ? `${d.display} ${d.full}` : ''].join(' '));
  const cls = i === 0 ? 'entry lead' : 'entry';
  const when = d
    ? `<time class="when tnum" datetime="${esc(d.iso)}">${esc(d.short)}<span class="vh"> ${esc(d.year)}</span></time>`
    : '<span class="when" aria-hidden="true"></span>';
  const facts = cat || size
    ? `<span class="facts">${cat ? `<span class="cat">${esc(cat)}</span>` : ''}${size ? `<span class="size tnum">${esc(size)}</span>` : ''}</span>`
    : '';
  return `<li class="${cls}" data-q="${esc(hay)}" data-c="${esc(norm(cat))}" style="--i:${Math.min(i, STAGGER_MAX)}">
${when}
<div class="body"><h3 class="title"><a href="${esc(href(r))}">${esc(topic)}</a></h3>${desc ? `<p class="desc">${esc(desc)}</p>` : ''}</div>
<div class="meta">${kind ? `<span class="kind">${esc(kind)}</span>` : ''}${facts}</div>
<span class="go">${ICON.arrow}</span>
</li>`;
}

function groupsHtml(reports) {
  const groups = [];
  for (const r of reports) {
    const d = parseDate(r.date);
    const key = d ? d.year : 'Undated';
    const g = groups.at(-1);
    if (g && g.key === key) g.items.push(r);
    else groups.push({ key, items: [r] });
  }
  let i = 0;
  return groups.map((g) => {
    const id = `y-${esc(g.key.toLowerCase())}`;
    const items = g.items.map((r) => entryHtml(r, i++)).join('\n');
    return `<section class="year" aria-labelledby="${id}">
<h2 class="year-h tnum" id="${id}">${esc(g.key)}</h2>
<ol class="entries">
${items}
</ol>
</section>`;
  }).join('\n');
}

export function render(reports = []) {
  const list = Array.isArray(reports) ? reports : [];
  const n = list.length;
  const withSearch = n >= SEARCH_MIN;
  const cats = categoriesOf(list);
  const withCats = cats.length >= 2;
  const bodyClass = [withSearch && 'has-bar', withCats && 'has-cats'].filter(Boolean).join(' ');
  const newest = list.map((r) => parseDate(r.date)).find(Boolean);
  const years = list.map((r) => parseDate(r.date)?.year).filter(Boolean).sort();
  const span = years.length ? (years[0] === years.at(-1) ? years[0] : `${years[0]}–${years.at(-1)}`) : '';
  const facts = n
    ? `${plural(n, 'report', 'reports')}${newest ? ` · Updated <time class="tnum" datetime="${esc(newest.iso)}">${esc(newest.display)}</time>` : ''}`
    : 'No reports yet';

  const bar = withSearch ? `<div class="bar">
<div class="wrap" role="search">
<div class="field">
${ICON.search}
<label class="vh" for="q">Search reports</label>
<input id="q" type="search" placeholder="Search reports" autocomplete="off" spellcheck="false" enterkeyhint="go" aria-describedby="status">
<kbd aria-hidden="true">/</kbd>
<button class="clear" id="clear" type="button" aria-label="Clear search" hidden>${ICON.close}</button>
</div>
<p class="status tnum" id="status" aria-live="polite"></p>
</div>
</div>` : '';

  const chip = (key, label, count, pressed) =>
    `<button class="chip" type="button" data-c="${esc(key)}" data-label="${esc(label)}" aria-pressed="${pressed}">${esc(label)}<span class="n">${count}</span></button>`;
  const filters = withCats ? `<div class="cats wrap">
<div class="cats-in" id="cats-in" role="group" aria-label="Filter by category">
${chip('', 'All', n, true)}
${cats.map((c) => chip(c.key, c.label, c.count, false)).join('\n')}
</div>${withSearch ? '' : '\n<p class="status vh" id="status" aria-live="polite"></p>'}
</div>` : '';

  const body = n
    ? `${groupsHtml(list)}${withSearch ? `
<div class="none" id="none" hidden><p>No reports match <q id="none-q"></q><span id="none-in"></span>.</p><button class="btn" id="none-clear" type="button">Clear search</button></div>` : ''}`
    : `<div class="empty"><h2>No reports yet</h2><p>Each report lives in its own folder as <code>index.html</code>. Add one, then run <code>node scripts/build.mjs</code>.</p></div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Research reports</title>
<meta name="description" content="An archive of research reports, newest first.">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f7f4ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#161513" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${esc(FAVICON)}">
<script>${HEAD_JS}</script>
<style>${CSS}</style>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to reports</a>
<header class="mast" id="top">
<div class="wrap">
<div class="top"><p>${facts}</p><button class="theme" type="button" data-theme-toggle aria-pressed="false" aria-label="Dark theme">${ICON.moon}<span class="lbl">Dark</span></button></div>
<h1>Research reports</h1>
<p class="lede">Newest first. Each report opens as one <span class="nw">self-contained</span> page.</p>
</div>
</header>
${bar}${filters}
<main id="main" class="wrap">
${body}
</main>
${n ? `<footer><div class="wrap"><div class="foot"><p>${plural(n, 'report', 'reports')}${span ? `, ${esc(span)}` : ''}</p><a href="#top">Back to top</a></div></div></footer>
` : ''}<script>${BODY_JS}</script>
</body>
</html>
`;
}
