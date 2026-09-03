/* ============================================================================
   India: 75 Years of Government Economic Performance
   Shared data module.

   Loaded by both `india-govt-economic-performance.html` (the full report) and
   `india-govt-wrapped.html` (the Instagram story deck) so that the two views
   can never drift apart. Everything is attached to `window.INDIA_DATA`.

   All indicator values are reproduced exactly as recorded in the source
   compilation. No interpolation or estimation is applied to missing values.
   The shock-adjustment layer is a clearly separated, explicitly documented
   overlay -- it never overwrites a recorded figure.
   ============================================================================ */
(function (global) {
  "use strict";

  /* --------------------------------------------------------------------------
     1. GOVERNMENTS
     `years` is the length of the term used for CAGR purposes. Short terms are
     flagged because a compound annual growth rate computed over ~2 years is
     dominated by the starting and ending year and is not comparable with a
     rate computed over a decade.
     -------------------------------------------------------------------------- */
  const GOVERNMENTS = [
    { id: "nehru",    name: "Jawaharlal Nehru",      short: "Nehru",      term: "1960–64", start: 1960, end: 1964, years: 4,  color: "#1DB954", shortTerm: false },
    { id: "indira1",  name: "Indira Gandhi",         short: "Indira I",   term: "1966–77", start: 1966, end: 1977, years: 11, color: "#FF6437", shortTerm: false },
    { id: "desai",    name: "Morarji Desai",         short: "Desai",      term: "1977–79", start: 1977, end: 1979, years: 2,  color: "#FFD2D7", shortTerm: true  },
    { id: "indira2",  name: "Indira Gandhi",         short: "Indira II",  term: "1980–84", start: 1980, end: 1984, years: 4,  color: "#F037A5", shortTerm: false },
    { id: "rajiv",    name: "Rajiv Gandhi",          short: "Rajiv",      term: "1984–89", start: 1984, end: 1989, years: 5,  color: "#8400E7", shortTerm: false },
    { id: "rao",      name: "P. V. Narasimha Rao",   short: "Rao",        term: "1991–96", start: 1991, end: 1996, years: 5,  color: "#0D73EC", shortTerm: false },
    { id: "vajpayee", name: "Atal Bihari Vajpayee",  short: "Vajpayee",   term: "1998–04", start: 1998, end: 2004, years: 6,  color: "#FFC864", shortTerm: false },
    { id: "singh",    name: "Manmohan Singh",        short: "Singh",      term: "2004–14", start: 2004, end: 2014, years: 10, color: "#19E68C", shortTerm: false },
    { id: "modi",     name: "Narendra Modi",         short: "Modi",       term: "2014–25", start: 2014, end: 2025, years: 11, color: "#25D1DA", shortTerm: false }
  ];

  const GOVTS = GOVERNMENTS.map(function (g) { return g.name + " (" + g.term + ")"; });

  /* --------------------------------------------------------------------------
     2. INDICATORS
     Value order matches GOVERNMENTS; null = no recorded observation.
     `outputGrowth` marks the real-activity growth series that the shock
     adjustment is applied to (see section 4).
     -------------------------------------------------------------------------- */
  const METRICS = [
    { key: "gdp",       label: "Real GDP (CAGR)",        shortLabel: "GDP growth",       unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: true,
      blurb: "How fast the whole economy grew, compounded every year of the term.",
      values: [5.01, 4.19, 0.09, 5.14, 5.90, 6.40, 6.16, 6.75, 5.99] },

    { key: "gdppc",     label: "Real GDP/Capita (CAGR)", shortLabel: "GDP per person",   unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: true,
      blurb: "Growth per person — the same economy, divided by a growing population.",
      values: [2.56, 1.88, -2.20, 2.70, 3.51, 4.23, 4.25, 5.22, 4.94] },

    { key: "rev",       label: "Govt Rev Growth (CAGR)", shortLabel: "Govt revenue",     unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: false,
      blurb: "How fast the government's own income grew.",
      values: [null, null, 16.73, 6.16, 9.87, 5.13, 10.29, 10.76, 3.54] },

    { key: "mfg",       label: "Mfg Output (CAGR)",      shortLabel: "Manufacturing",    unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: true,
      blurb: "Factories, plants and workshops — the make-things part of the economy.",
      values: [8.04, 4.57, 4.28, 6.44, 6.30, 9.42, 5.91, 7.82, 6.76] },

    { key: "svc",       label: "Services Output (CAGR)", shortLabel: "Services",         unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: true,
      blurb: "IT, finance, retail, transport — now the biggest slice of Indian GDP.",
      values: [5.29, 4.28, 4.43, 6.54, 7.77, 6.91, 7.61, 7.86, 6.50] },

    { key: "stock",     label: "Stock Market (CAGR)",    shortLabel: "Stock market",     unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: false,
      blurb: "What the market did. Only on record for the three most recent terms.",
      values: [null, null, null, null, null, null, 4.32, 17.03, 11.26] },

    { key: "exports",   label: "Exports (% GDP)",        shortLabel: "Exports",          unit: "%", group: "share",  higherIsBetter: true,  outputGrowth: false,
      blurb: "How much India sold to the world, as a share of the economy.",
      values: [4.19, 4.60, 6.48, 6.04, 5.90, 9.71, 13.59, 22.17, 20.84] },

    { key: "imports",   label: "Imports (% GDP)",        shortLabel: "Imports",          unit: "%", group: "share",  higherIsBetter: true,  outputGrowth: false,
      blurb: "How much India bought from the world. Read as openness, not as a win.",
      values: [6.08, 5.25, 7.01, 8.31, 7.50, 10.28, 14.85, 26.37, 23.12] },

    { key: "fdi",       label: "FDI (% GDP)",            shortLabel: "Foreign investment", unit: "%", group: "share", higherIsBetter: true, outputGrowth: false,
      blurb: "Foreign money invested directly into India, as a share of GDP.",
      values: [null, null, 0.01, 0.03, 0.05, 0.31, 0.76, 1.84, 1.54] },

    { key: "debt",      label: "Debt/GDP (Avg)",         shortLabel: "Public debt",      unit: "%", group: "lower",  higherIsBetter: false, outputGrowth: false,
      blurb: "Government debt as a share of GDP. Lower is better.",
      values: [null, null, null, null, null, 74.43, 78.67, 73.43, 78.43] },

    { key: "inflation", label: "Avg Inflation (Avg)",    shortLabel: "Inflation",        unit: "%", group: "lower",  higherIsBetter: false, outputGrowth: false,
      blurb: "How fast prices rose. Lower is better — this is the one you feel.",
      values: [4.68, 7.76, 5.70, 10.51, 7.98, 10.24, 5.37, 7.86, 4.91] }
  ];

  /* --------------------------------------------------------------------------
     3. HELPERS
     -------------------------------------------------------------------------- */
  function fmt(v) { return v === null || v === undefined ? "—" : v.toFixed(2) + "%"; }
  function fmtSigned(v) {
    if (v === null || v === undefined) return "—";
    return (v > 0 ? "+" : "") + v.toFixed(2);
  }

  // Normalise to 0..1 across the supplied values, inverting when lower is better.
  function normalise(values, higherIsBetter) {
    const present = values.filter(function (v) { return v !== null && v !== undefined; });
    if (!present.length) return values.map(function () { return null; });
    const min = Math.min.apply(null, present);
    const max = Math.max.apply(null, present);
    const span = max - min;
    return values.map(function (v) {
      if (v === null || v === undefined) return null;
      const scaled = span === 0 ? 0.5 : (v - min) / span;
      return higherIsBetter ? scaled : 1 - scaled;
    });
  }

  function mean(arr) {
    const present = arr.filter(function (v) { return v !== null && v !== undefined && !isNaN(v); });
    if (!present.length) return null;
    return present.reduce(function (a, b) { return a + b; }, 0) / present.length;
  }

  global.INDIA_DATA = {
    GOVERNMENTS: GOVERNMENTS,
    GOVTS: GOVTS,
    METRICS: METRICS,
    fmt: fmt,
    fmtSigned: fmtSigned,
    normalise: normalise,
    mean: mean
  };
})(window);
