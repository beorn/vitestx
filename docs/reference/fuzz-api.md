# Fuzz API

## gen()

```typescript
function gen<T>(picker: Picker<T>, seed?: number): AsyncGenerator<T>
```

Creates an infinite async generator from a picker specification.

### Picker Types

```typescript
type Picker<T> =
  | T[]                                           // Uniform random from array
  | [number, T][]                                 // Weighted random
  | (ctx: PickerContext) => T | T[] | Iterable<T> // Sync function
  | (ctx: PickerContext) => Promise<T | T[] | Iterable<T>> // Async function
```

### PickerContext

```typescript
interface PickerContext {
  random: SeededRandom // Seeded RNG instance
  iteration: number // Current iteration (0-indexed)
}
```

### Examples

```typescript
// Uniform
gen(["a", "b", "c"])

// Weighted
gen([
  [80, "common"],
  [20, "rare"],
])

// Custom sync
gen((ctx) => ctx.random.pick(items))

// Custom async
gen(async (ctx) => await fetchAction())

// Multi-value (flattened)
gen(() => ["x", "y", "z"])

// Explicit seed
gen(["a", "b"], 42)
```

## take()

```typescript
function take<T>(generator: AsyncIterable<T>, n: number): AsyncGenerator<T>
```

Limits an async iterable to `n` items. Inside `test.fuzz()`, automatically records yielded values for shrinking via `AsyncLocalStorage`.

In replay mode (during shrinking), yields from the saved sequence instead of the generator.

## test.fuzz()

```typescript
function test.fuzz(
  name: string,
  fn: () => Promise<void>,
  options?: FuzzTestOptions
): void

function test.fuzz(
  name: string,
  options: FuzzTestOptions,
  fn: () => Promise<void>
): void
```

Wraps vitest `test()` with fuzz infrastructure. When `FUZZ_REPEATS > 1`, registers multiple vitest tests with deterministically derived seeds.

### FuzzTestOptions

```typescript
interface FuzzTestOptions extends TestOptions {
  seed?: number // Default: from FUZZ_SEED env or Date.now()
  shrink?: boolean // Default: true
  save?: boolean // Default: true
  replay?: boolean // Default: true
  maxShrinkAttempts?: number // Default: 100
}
```

## FuzzError

```typescript
class FuzzError extends Error {
  readonly sequence: unknown[] // Minimal failing sequence
  readonly shrunk: unknown[] // Same as sequence
  readonly seed: number // Seed for reproduction
  readonly originalError: Error // The original assertion error
}
```

Thrown when a fuzz test fails. Contains the shrunk sequence and seed for reproduction.

## createSeededRandom()

```typescript
function createSeededRandom(seed?: number): SeededRandom
```

Creates a deterministic random number generator using a Linear Congruential Generator (LCG).

### SeededRandom

```typescript
interface SeededRandom {
  seed: number // Current seed state
  int(min: number, max: number): number // Random integer in [min, max]
  float(): number // Random float in [0, 1)
  pick<T>(array: readonly T[]): T // Random element from array
  weightedPick<T>(items: readonly T[], weights: Partial<Record<T, number>>): T
  shuffle<T>(array: readonly T[]): T[] // Shuffled copy
  array<T>(length: number, gen: () => T): T[] // Random array
  bool(probability?: number): boolean // Random boolean (default: 0.5)
  fork(): SeededRandom // Independent child stream
}
```

## shrinkSequence()

```typescript
function shrinkSequence<T>(
  sequence: T[],
  runTest: (seq: T[]) => Promise<boolean>,
  options?: ShrinkOptions,
): Promise<ShrinkResult<T>>
```

Delta-debugging algorithm that reduces a failing sequence to its minimal form.

### ShrinkOptions

```typescript
interface ShrinkOptions {
  maxAttempts?: number // Default: 100
  minLength?: number // Default: 1
}
```

### ShrinkResult

```typescript
interface ShrinkResult<T> {
  original: T[] // Original failing sequence
  shrunk: T[] // Minimal failing sequence
  attempts: number // Number of attempts made
  reduced: boolean // Whether shrinking found a smaller sequence
}
```

## formatShrinkResult()

```typescript
function formatShrinkResult<T>(result: ShrinkResult<T>): string
```

Formats a shrink result for display, showing reduction percentage and attempt count.

## Regression Functions

### saveCase()

```typescript
function saveCase(testFilePath: string, testName: string, failure: SavedCase): string
```

Saves a failing case to `__fuzz_cases__/`. Returns the filepath.

### loadCases()

```typescript
function loadCases(testFilePath: string): SavedCase[]
```

Loads all saved cases for a test file.

### loadCasesForTest()

```typescript
function loadCasesForTest(testFilePath: string, testName: string): SavedCase[]
```

Loads saved cases filtered by test name.

### deleteCase()

```typescript
function deleteCase(testFilePath: string, filename: string): void
```

Deletes a saved case file.

### clearCases()

```typescript
function clearCases(testFilePath: string): void
```

Clears all saved cases for a test file.

### SavedCase

```typescript
interface SavedCase {
  test: string // Test name
  seed: number // Seed used for generation
  sequence: unknown[] // Minimal failing sequence
  error: string // Error message
  timestamp: string // ISO timestamp
  originalLength?: number // Original length before shrinking
}
```

## FuzzContext

```typescript
interface FuzzContext {
  history: unknown[] // Recorded yielded values
  replaySequence: unknown[] | null // Sequence to replay (if replaying)
  replayIndex: number // Current replay position
  seed: number // Seed for this run
}
```

### Context Functions

```typescript
function createFuzzContext(seed: number): FuzzContext
function createReplayContext(sequence: unknown[], seed: number): FuzzContext
function isInFuzzContext(): boolean
function getFuzzContext(): FuzzContext | undefined
```

## Utility Functions

### parseSeed()

```typescript
function parseSeed(source?: "env" | "random"): number
```

Reads `FUZZ_SEED` from environment or generates a random seed.

### parseRepeats()

```typescript
function parseRepeats(): number
```

Reads `FUZZ_REPEATS` from environment. Default: 1.

### deriveSeeds()

```typescript
function deriveSeeds(baseSeed: number, count: number): number[]
```

Deterministically derives N unique seeds from a base seed.

### getTestSys()

```typescript
function getTestSys(): TestSys
type TestSys = "fake" | "real:mem" | "real:disk"
```

Reads `TEST_SYS` environment variable. Controls test implementation strategy.
