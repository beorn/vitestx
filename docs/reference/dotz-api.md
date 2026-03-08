# Dotz API

## DotzReporter

```typescript
class DotzReporter implements Reporter {
  constructor(options?: ReporterOptions)
}
```

The main Vitest reporter class. Implements the Vitest `Reporter` interface.

### ReporterOptions

```typescript
interface ReporterOptions {
  slowThreshold?: number  // Duration (ms) to consider a test "slow" (default: 100)
  perfOutput?: string     // File path to write performance JSON (default: "")
  showSlow?: boolean      // Show slow test summary after run (default: true)
  symbols?: string[]      // Duration dot symbols (default: ["·", "•", "●"])
}
```

### Usage

```typescript
// As a string reference
export default defineConfig({
  test: {
    reporters: ["vitestx/dotz"],
  },
})

// As an instance with options
import DotzReporter from "vitestx/dotz"

export default defineConfig({
  test: {
    reporters: [
      new DotzReporter({
        slowThreshold: 200,
        showSlow: true,
        perfOutput: "test-perf.json",
      }),
    ],
  },
})
```

## Constants

```typescript
const MAX_SLOW_TESTS = 20         // Maximum slow tests shown in summary
const DURATION_MULTIPLIER = 10    // Symbol range: 0x to 10x threshold
const UNMOUNT_DELAY_MS = 50       // Delay before unmounting hightea app
const DEFAULT_SYMBOLS = ["·", "•", "●"]
```

## Status Dots

```typescript
const STATUS_DOTS = {
  failed:  { char: "x", color: "red",     label: "fail" },
  skipped: { char: "-", color: "gray",     dim: true, label: "skip" },
  pending: { char: "*", color: "yellow",   label: "pending" },
  noisy:   { char: "!", color: "magenta",  label: "noisy" },
}
```

## durationToSymbol()

```typescript
function durationToSymbol(
  duration: number,
  threshold: number,
  symbols: string[]
): { char: string; bright: boolean }
```

Maps a test duration to a symbol and brightness. The range `[0, threshold * DURATION_MULTIPLIER]` maps linearly across the symbol array. Tests exceeding the range get the last symbol with `bright: true`.

## React Components

The reporter renders using hightea React components. These are exported for testing:

### Report

```typescript
function Report(props: ReportProps): JSX.Element

interface ReportProps {
  store: TestStore
  options: Options
  width?: number              // Override width (bypasses useContentRect)
  console?: PatchedConsole    // Captured console output
}
```

Top-level component. During live streaming, shows only dots and summary. After completion, also shows the package table, slow tests, and failures.

### DotsSection

Renders all test dots grouped by package, with automatic file breakout for large packages based on screen height.

### DotStrip

Bulk dot renderer that batches consecutive same-styled dots into single `<Text>` nodes for performance. For 4700 tests, this produces ~10-50 React elements instead of 4700.

### Summary

Displays pass/fail/skip counts, total tests, wall-clock time, and sum of test durations.

### PackageTable

Per-package breakdown with columns: PACKAGE, TESTS, TIME, SLOW. Only shown when there are multiple packages.

### SlowTests

Lists the slowest tests with duration symbols, timings, file locations, and test names. Limited to `MAX_SLOW_TESTS`.

### Failures

Lists all failed tests with error messages and stack traces.

## Formatting Helpers

```typescript
function fmtDuration(ms: number): string  // "42ms", "1.50s", "2m 30s"
function fmtMs(ms: number): string        // "42ms", "1.5s"
```
