# Dotz Reporter

A streaming Vitest reporter that renders test results as colored dots using [silvery](https://github.com/beorn/silvery) (React terminal UI).

## Setup

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    reporters: ["vitestx/dotz"],
  },
})
```

Or from the command line:

```bash
vitest run --reporter=vitestx/dotz
```

## Dot Symbols

Tests are rendered as dots whose shape reflects duration:

| Symbol | Meaning         |
| ------ | --------------- |
| `·`    | Fast            |
| `•`    | Medium          |
| `●`    | Slow            |
| `x`    | Failed          |
| `-`    | Skipped         |
| `*`    | Pending         |
| `!`    | Noisy (console) |

Duration thresholds are configurable via `slowThreshold`. The range from 0 to `slowThreshold * 10` maps across the symbol set.

## Features

- **Incremental rendering** via `useSyncExternalStore` + silvery `flush()` -- dots appear as tests complete
- **Per-package grouping** -- tests categorized by `package.json` name with auto-detected packages
- **File breakout** -- large packages expand to show per-file dot rows when screen space allows
- **Screen-aware layout** -- dynamically adjusts breakout based on available terminal height
- **Slow test summary** -- lists the slowest tests with file locations
- **Package table** -- per-package stats (tests, time, slow count) shown after the run
- **Console capture** -- stdout/stderr captured via silvery `<Console />`
- **CI fallback** -- static output for non-TTY environments
- **Performance export** -- optional JSON output of all test timings

## Configuration

```typescript
import DotzReporter from "vitestx/dotz"

// In vitest.config.ts
export default defineConfig({
  test: {
    reporters: [
      new DotzReporter({
        slowThreshold: 100, // ms threshold for "slow" (default: 100)
        showSlow: true, // show slow test summary (default: true)
        perfOutput: "", // path to write performance JSON (default: none)
        symbols: ["·", "•", "●"], // duration symbols (default)
      }),
    ],
  },
})
```
