# Prometheus graph focus verification

Evidence for prometheus/prometheus#10133, prepared on 17 November 2026 (IST).

- Baseline: b2a602494b65bda38316eabaef7e0d834a6814dd.
- Implementation: 537cc56 (ui: emphasize focused graph series).
- Browser harness imports the actual Mantine UI chart helpers and uPlot dependency, with synthetic data. It does not exercise a running Prometheus backend.
- Before screenshot disables the new focus hook to reproduce the baseline rendering; after screenshot enables it.
- Observed graph and legend focus, focus clearing, series isolation and restoration, dark stacked charts, and a dark line chart with 700 series of 600 samples each.
- Focused line changes from 1.5 to 3 CSS pixels. Unfocused lines stay at 1.5 CSS pixels.
- These screenshots are manual functional evidence, not a cross-browser or performance benchmark.

The evidence branch is separate from the implementation pull request.
