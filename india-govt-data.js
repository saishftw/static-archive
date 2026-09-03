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
      caution: "Definition unclear and internally inconsistent. Central government gross tax revenue grew at roughly 11–12% a year in nominal terms between 2014-15 and 2024-25, against the 3.54% recorded here. The figure is only reconcilable if it is measured in real terms or covers a narrower revenue base than the other terms — in which case the terms are not comparable with each other.",
      blurb: "How fast the government's own income grew.",
      values: [null, null, 16.73, 6.16, 9.87, 5.13, 10.29, 10.76, 3.54] },

    { key: "mfg",       label: "Mfg Output (CAGR)",      shortLabel: "Manufacturing",    unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: true,
      blurb: "Factories, plants and workshops — the make-things part of the economy.",
      values: [8.04, 4.57, 4.28, 6.44, 6.30, 9.42, 5.91, 7.82, 6.76] },

    { key: "svc",       label: "Services Output (CAGR)", shortLabel: "Services",         unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: true,
      blurb: "IT, finance, retail, transport — now the biggest slice of Indian GDP.",
      values: [5.29, 4.28, 4.43, 6.54, 7.77, 6.91, 7.61, 7.86, 6.50] },

    { key: "stock",     label: "Stock Market (CAGR)",    shortLabel: "Stock market",     unit: "%", group: "growth", higherIsBetter: true,  outputGrowth: false,
      caution: "Extremely sensitive to the exact start and end dates chosen. All three recorded values are defensible against Sensex history, but shifting the endpoints by a few months moves each of them by several percentage points, so the gaps between them should not be read as precise.",
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

  /* --------------------------------------------------------------------------
     4. EXOGENOUS SHOCK INVENTORY
     Each entry records a shock that materially affected Indian output, the term
     it fell in, and a published/estimated drag on real GDP growth expressed in
     percentage points relative to trend for the year(s) affected.

     Two rules are applied deliberately and symmetrically:

       (a) POSITIVE shocks count too. The 2014–16 collapse in crude prices was a
           large windfall for a net oil importer and is recorded as a negative
           drag (i.e. a tailwind), exactly as the 1973 and 1979 oil shocks are
           recorded as headwinds.

       (b) POLICY-INDUCED events are listed but NOT adjusted for. Demonetisation,
           the GST rollout and the Pokhran-II sanctions were choices, and the
           consequences of choices are precisely what a performance comparison
           is supposed to capture. They appear here for transparency, flagged
           `adjust: false`, so a reader can see what was deliberately left in.

     Impact figures are mid-points of the published ranges and carry real
     uncertainty — see `SHOCK_CAVEATS`. They are estimates, not measurements.
     -------------------------------------------------------------------------- */
  const SHOCKS = [
    { govt: "nehru",    name: "Sino-Indian War",                       years: "1962–63",   ppLost: 2.5,   kind: "exogenous",       adjust: true  },
    { govt: "indira1",  name: "Drought & food crisis",                 years: "1966–67",   ppLost: 3.5,   kind: "exogenous",       adjust: true  },
    { govt: "indira1",  name: "Bangladesh war & refugee crisis",       years: "1971–72",   ppLost: 2.5,   kind: "exogenous",       adjust: true  },
    { govt: "indira1",  name: "Drought",                               years: "1972–73",   ppLost: 3.5,   kind: "exogenous",       adjust: true  },
    { govt: "indira1",  name: "First oil shock (OPEC embargo)",        years: "1973–75",   ppLost: 5.0,   kind: "exogenous",       adjust: true  },
    { govt: "desai",    name: "Second oil shock + severe drought",     years: "1979–80",   ppLost: 9.0,   kind: "exogenous",       adjust: true  },
    { govt: "indira2",  name: "Global recession, oil-shock aftermath", years: "1980–82",   ppLost: 3.0,   kind: "exogenous",       adjust: true  },
    { govt: "rajiv",    name: "Drought",                               years: "1987–88",   ppLost: 1.75,  kind: "exogenous",       adjust: true  },
    { govt: "rao",      name: "Gulf War oil spike (BoP crisis trigger)", years: "1990–92", ppLost: 2.0,   kind: "exogenous",       adjust: true  },
    { govt: "vajpayee", name: "Asian Financial Crisis",                years: "1997–98",   ppLost: 2.5,   kind: "exogenous",       adjust: true  },
    { govt: "vajpayee", name: "Pokhran-II sanctions",                  years: "1998–99",   ppLost: 0.75,  kind: "policy-induced",  adjust: false },
    { govt: "vajpayee", name: "Dot-com bust",                          years: "2001–02",   ppLost: 2.25,  kind: "exogenous",       adjust: true  },
    { govt: "vajpayee", name: "Drought",                               years: "2002–03",   ppLost: 2.5,   kind: "exogenous",       adjust: true  },
    { govt: "singh",    name: "Global Financial Crisis",               years: "2008–09",   ppLost: 3.0,   kind: "exogenous",       adjust: true  },
    { govt: "singh",    name: "Drought",                               years: "2009–10",   ppLost: 0.75,  kind: "exogenous",       adjust: true  },
    { govt: "singh",    name: "Taper tantrum / rupee crisis",          years: "2013–14",   ppLost: 0.75,  kind: "exogenous",       adjust: true  },
    { govt: "modi",     name: "Back-to-back droughts",                 years: "2014–16",   ppLost: 1.5,   kind: "exogenous",       adjust: true  },
    { govt: "modi",     name: "Oil price collapse (WINDFALL)",         years: "2015–17",   ppLost: -0.9,  kind: "exogenous",       adjust: true  },
    { govt: "modi",     name: "Demonetisation",                        years: "2016–17",   ppLost: 1.5,   kind: "policy-induced",  adjust: false },
    { govt: "modi",     name: "GST rollout disruption",                years: "2017–18",   ppLost: 1.5,   kind: "policy-induced",  adjust: false },
    { govt: "modi",     name: "COVID-19 pandemic",                     years: "2020–21",   ppLost: 12.5,  kind: "exogenous",       adjust: true  },
    { govt: "modi",     name: "Russia–Ukraine war / commodity spike",  years: "2022–23",   ppLost: 0.75,  kind: "exogenous",       adjust: true  }
  ];

  /* Approximate average world real GDP growth during each term, used to judge
     whether a government was swimming with or against the global tide. Derived
     from World Bank / IMF world aggregates by decade; approximate by design. */
  const WORLD_GROWTH = {
    nehru: 5.4, indira1: 4.6, desai: 4.0, indira2: 2.3, rajiv: 3.7,
    rao: 2.5, vajpayee: 3.2, singh: 3.0, modi: 2.6
  };

  const SHOCK_CAVEATS = [
    "One of the eleven indicators does not reconcile against public data. The government revenue series records 3.54% annual growth for 2014–25, against roughly 11–12% nominal growth in central government gross tax revenue over the same years. It is left in the score for transparency, but it moves the ranking and it should not.",
    "Shock impacts are estimates from published ranges, not measurements. Oil-shock and demonetisation drag estimates in particular vary widely between models.",
    "Handling a crisis well is itself a test of governance. Fully subtracting a shock credits a government for a recovery it may not have earned, and penalises none for a downturn it worsened.",
    "Several events are only partly exogenous. The 1991 balance-of-payments crisis followed a decade of domestic fiscal expansion; only the Gulf War oil spike is treated as external here.",
    "Choosing what counts as a shock is itself a political act. The list is published in full precisely so that the choices can be argued with.",
    "Short terms distort everything. Morarji Desai's roughly two-year window means one catastrophic year sets the entire compound rate, and the shock adjustment then swings it violently the other way.",
    "Growth series cross the 2011–12 GDP base-year revision, whose back-series remains contested. Values either side of it are not perfectly comparable.",
    "Three terms are missing from the underlying compilation entirely — Shastri (1964–66), V. P. Singh / Chandra Shekhar (1989–91) and Deve Gowda / Gujral (1996–98) — so some shock years fall outside any government shown."
  ];

  /* --------------------------------------------------------------------------
     5. SCORING ENGINE
     Raw score      : mean of each government's normalised (0–1) scores across
                      every indicator it has an observation for, scaled to 100.
     Adjusted score : the same, computed on a counterfactual in which the
                      average annual exogenous shock drag is added back to the
                      four real-output growth series before normalisation.
     -------------------------------------------------------------------------- */

  // Average annual exogenous drag on GDP growth, in percentage points, per term.
  function shockDrag(govId) {
    const g = GOVERNMENTS.find(function (x) { return x.id === govId; });
    const total = SHOCKS
      .filter(function (s) { return s.govt === govId && s.adjust; })
      .reduce(function (a, s) { return a + s.ppLost; }, 0);
    return total / g.years;
  }

  function computeLeaderboard() {
    const drags = GOVERNMENTS.map(function (g) { return shockDrag(g.id); });

    // Counterfactual values: real-output growth with the exogenous drag added back.
    const adjustedValues = METRICS.map(function (m) {
      return m.values.map(function (v, i) {
        if (v === null) return null;
        return m.outputGrowth ? v + drags[i] : v;
      });
    });

    const rawNorm = METRICS.map(function (m) { return normalise(m.values, m.higherIsBetter); });
    const adjNorm = METRICS.map(function (m, mi) { return normalise(adjustedValues[mi], m.higherIsBetter); });

    const rows = GOVERNMENTS.map(function (g, gi) {
      const rawScores = rawNorm.map(function (col) { return col[gi]; });
      const adjScores = adjNorm.map(function (col) { return col[gi]; });
      const coverage = METRICS.filter(function (m) { return m.values[gi] !== null; }).length;
      const rawMean = mean(rawScores);
      const adjMean = mean(adjScores);
      const gdp = METRICS[0].values[gi];

      return {
        id: g.id,
        name: g.name,
        short: g.short,
        term: g.term,
        color: g.color,
        years: g.years,
        shortTerm: g.shortTerm,
        coverage: coverage,
        drag: drags[gi],
        worldGrowth: WORLD_GROWTH[g.id],
        excessOverWorld: gdp === null ? null : gdp - WORLD_GROWTH[g.id],
        rawScore: rawMean === null ? null : rawMean * 100,
        adjScore: adjMean === null ? null : adjMean * 100,
        adjustedGdp: gdp === null ? null : gdp + drags[gi]
      };
    });

    // Rank both scorings (1 = best), then record how far the adjustment moved each.
    function rank(key, target) {
      rows.slice()
        .sort(function (a, b) { return b[key] - a[key]; })
        .forEach(function (r, i) { r[target] = i + 1; });
    }
    rank("rawScore", "rawRank");
    rank("adjScore", "adjRank");
    rows.forEach(function (r) { r.rankChange = r.rawRank - r.adjRank; });

    // Count of indicators on which each government is the single best performer.
    rows.forEach(function (r) { r.wins = 0; r.winLabels = []; });
    METRICS.forEach(function (m) {
      let bestIdx = -1, best = null;
      m.values.forEach(function (v, i) {
        if (v === null) return;
        if (best === null || (m.higherIsBetter ? v > best : v < best)) { best = v; bestIdx = i; }
      });
      if (bestIdx >= 0) { rows[bestIdx].wins++; rows[bestIdx].winLabels.push(m.shortLabel); }
    });

    return rows;
  }

  global.INDIA_DATA = {
    GOVERNMENTS: GOVERNMENTS,
    GOVTS: GOVTS,
    METRICS: METRICS,
    SHOCKS: SHOCKS,
    SHOCK_CAVEATS: SHOCK_CAVEATS,
    WORLD_GROWTH: WORLD_GROWTH,
    fmt: fmt,
    fmtSigned: fmtSigned,
    normalise: normalise,
    mean: mean,
    shockDrag: shockDrag,
    computeLeaderboard: computeLeaderboard,
    LEADERBOARD: computeLeaderboard()
  };
})(window);
