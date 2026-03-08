# vitestx

Fuzz testing, chaos streams, and a streaming reporter for Vitest.

## Fuzz Testing

Async generators with auto-shrinking, regression cases, and seeded RNG.

```typescript
import { test, gen, take } from "vitestx"

test.fuzz("cursor stays in bounds", async () => {
  for await (const key of take(gen(["j", "k", "h", "l"]), 100)) {
    await handle.press(key)
    expect(getCursor()).toBeGreaterThanOrEqual(0)
  }
  // On failure: auto-shrinks to minimal repro, saves to __fuzz_cases__/
})
```

Generators support uniform arrays, weighted tuples, sync/async picker functions, and multi-value returns.

## Chaos Streams

Composable async iterable transformers that simulate unreliable delivery.

```typescript
import { drop, reorder, chaos } from "vitestx/chaos"

// Manual composition
const unreliable = reorder(drop(source, 0.2, rng), 5, rng)

// Declarative pipeline
const chaotic = chaos(source, [
  { type: "drop", params: { rate: 0.2 } },
  { type: "reorder", params: { windowSize: 5 } },
  { type: "duplicate", params: { rate: 0.1 } },
], rng)
```

Built-in transformers: `drop`, `reorder`, `duplicate`, `burst`, `initGap`, `delay`. Extend with custom registries.

## Dotz Reporter

Streaming dot reporter with hightea React TUI. Duration-based symbols, per-package grouping, CI fallback.

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    reporters: ["vitestx/dotz"],
  },
})
```

| Symbol | Meaning |
| ------ | ------- |
| `·•●`  | Fast / medium / slow (duration-based) |
| `x`    | Failed |
| `-`    | Skipped |
| `!`    | Noisy (console output) |

## Install

```bash
bun add vitestx
```

## Docs

[vitestx.github.io](https://beorn.github.io/vitestx/)

## License

MIT
