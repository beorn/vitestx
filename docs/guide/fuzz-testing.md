# Fuzz Testing

vitestx provides three composable primitives for fuzz testing:

| Primitive      | What it does                                               |
| -------------- | ---------------------------------------------------------- |
| `gen(picker)`  | Infinite async generator of random values                  |
| `take(gen, n)` | Limits iteration, auto-tracks values via AsyncLocalStorage |
| `test.fuzz()`  | Wraps vitest `test()` with shrinking and regression        |

## Generators

### Uniform Random

Pick randomly from an array with equal probability:

```typescript
gen(["j", "k", "h", "l"])
```

### Weighted Random

Specify weights as `[weight, value]` tuples:

```typescript
gen([
  [40, "j"],
  [40, "k"],
  [10, "Enter"],
  [10, "Escape"],
])
```

### Custom Picker

Use a function for stateful or context-dependent generation:

```typescript
gen((ctx) => {
  const state = getState()
  if (state.cursor === 0) return ctx.random.pick(["j", "l"])
  return ctx.random.pick(["j", "k", "h", "l"])
})
```

### Async Picker

Pickers can be async -- call an LLM, read a file, whatever:

```typescript
gen(async (ctx) => {
  const suggestion = await askModel(describeState())
  return suggestion
})
```

### Multi-Value Picker

Return an array or iterable to yield multiple values per pick:

```typescript
gen(() => ["j", "j", "Enter"]) // yields: j, j, Enter, j, j, Enter, ...
```

## take()

Limits an async generator to `n` iterations. When running inside `test.fuzz()`, it automatically tracks yielded values via `AsyncLocalStorage` for shrinking and regression.

```typescript
for await (const key of take(gen(["j", "k"]), 100)) {
  await handle.press(key)
}
```

## test.fuzz()

Wraps vitest's `test()` with automatic shrinking and regression case management.

```typescript
import { test, gen, take } from "vitestx"

test.fuzz("cursor invariants", async () => {
  const handle = await setup()
  for await (const key of take(gen(["j", "k", "h", "l"]), 100)) {
    await handle.press(key)
    expect(handle.locator("[data-cursor]").count()).toBe(1)
  }
})
```

### Options

```typescript
test.fuzz("name", async () => { ... }, {
  seed: 42,                // Fixed seed (default: from FUZZ_SEED env or random)
  shrink: true,            // Auto-shrink failing sequences (default: true)
  save: true,              // Save failures to __fuzz_cases__/ (default: true)
  replay: true,            // Replay saved cases first (default: true)
  maxShrinkAttempts: 100,  // Max shrinking iterations (default: 100)
})
```

## Auto-Shrinking

When a fuzz test fails, vitestx uses delta debugging to find the minimal failing sequence:

1. **Detect** -- the test body throws an assertion error
2. **Shrink** -- binary search removes chunks of the sequence, checking if the test still fails
3. **Report** -- the minimal sequence is logged with the seed for reproduction
4. **Save** -- the case is written to `__fuzz_cases__/` as a regression guard

The shrinking algorithm tries removing halves first, then individual elements, repeating until no further reduction is possible.

## Regression Cases

Failing sequences are saved to `__fuzz_cases__/` next to your test file, similar to Vitest snapshots:

```
tests/
  cursor.fuzz.ts
  __fuzz_cases__/
    cursor.fuzz.ts/
      cursor-stays-in-bounds-1706123456789.json
```

On subsequent runs, saved cases are replayed **before** the random run. If a saved case still fails, it reports immediately. Commit `__fuzz_cases__/` to your repo to guard against regressions.

## Seeded RNG

All randomness flows through a seeded RNG for reproducibility:

```typescript
import { createSeededRandom } from "vitestx"

const rng = createSeededRandom(42)
rng.int(0, 100)        // deterministic integer in [min, max]
rng.float()            // deterministic float in [0, 1)
rng.pick(["a", "b"])   // deterministic pick from array
rng.bool(0.3)          // 30% chance of true
rng.shuffle([1, 2, 3]) // deterministic shuffle
rng.fork()             // independent child stream
```

### Environment Variables

| Variable       | Effect                                              |
| -------------- | --------------------------------------------------- |
| `FUZZ_SEED`    | Fixed seed for all fuzz tests                       |
| `FUZZ_REPEATS` | Run each fuzz test N times with different seeds     |

```bash
# Reproduce a specific failure
FUZZ_SEED=12345 bun test

# Nightly stress test
FUZZ_REPEATS=10000 bun test
```
