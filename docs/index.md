---
layout: home

hero:
  name: vitestx
  text: Vitest Extensions
  tagline: Fuzz testing, chaos streams, and a streaming reporter for Vitest.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /reference/fuzz-api

features:
  - title: Fuzz Testing
    details: "gen() + take() async generators with test.fuzz() wrapper. Write property-based tests that find edge cases automatically."
  - title: Chaos Streams
    details: "Composable async iterable transformers that simulate unreliable delivery: drops, reordering, duplicates, bursts, delays."
  - title: Dotz Reporter
    details: "Streaming Vitest reporter with hightea React TUI. Duration-based dots, per-package display, CI fallback."
  - title: Auto-Shrinking
    details: "Delta-debugging automatically reduces failing sequences to the minimal reproduction. No manual bisecting."
  - title: Seeded RNG
    details: "Deterministic random number generator for reproducible tests. Set FUZZ_SEED to replay any failure exactly."
  - title: Regression Cases
    details: "Failing sequences saved to __fuzz_cases__/ and replayed automatically on subsequent runs, like snapshots."
---
