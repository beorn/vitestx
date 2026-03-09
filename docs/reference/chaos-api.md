# Chaos API

All transformers are async generator functions that take an `AsyncIterable<T>` source and return an `AsyncGenerator<T>`.

## Transformers

### drop()

```typescript
function drop<T>(source: AsyncIterable<T>, rate: number, rng: SeededRandom): AsyncGenerator<T>
```

Skips items with probability `rate`. Simulates message loss, queue overflow, network drops.

**Parameters:**

- `rate` -- Probability of dropping each item (0 to 1)
- `rng` -- Seeded random instance

### reorder()

```typescript
function reorder<T>(source: AsyncIterable<T>, windowSize: number, rng: SeededRandom): AsyncGenerator<T>
```

Buffers up to `windowSize` items, shuffles the buffer, then yields all items. Remaining items are shuffled and yielded at the end. Simulates out-of-order delivery.

**Parameters:**

- `windowSize` -- Number of items to buffer before shuffling
- `rng` -- Seeded random instance

### duplicate()

```typescript
function duplicate<T>(source: AsyncIterable<T>, rate: number, rng: SeededRandom): AsyncGenerator<T>
```

Yields each item, then with probability `rate` yields it again. Simulates duplicate delivery or at-least-once semantics.

**Parameters:**

- `rate` -- Probability of duplicating each item (0 to 1)
- `rng` -- Seeded random instance

### burst()

```typescript
function burst<T>(source: AsyncIterable<T>, burstSize: number): AsyncGenerator<T>
```

Collects `burstSize` items into a buffer, then yields them all at once. Remaining items are yielded at the end. Simulates bursty delivery or batched network packets.

**Parameters:**

- `burstSize` -- Number of items per burst

### initGap()

```typescript
function initGap<T>(source: AsyncIterable<T>, count: number): AsyncGenerator<T>
```

Skips the first `count` items. Simulates missed events during initialization or late subscriber join.

**Parameters:**

- `count` -- Number of items to skip from the beginning

### delay()

```typescript
function delay<T>(source: AsyncIterable<T>, minMs: number, maxMs: number, rng: SeededRandom): AsyncGenerator<T>
```

Adds a random delay (uniform between `minMs` and `maxMs`) before yielding each item. Simulates slow I/O or network latency.

**Parameters:**

- `minMs` -- Minimum delay in milliseconds
- `maxMs` -- Maximum delay in milliseconds
- `rng` -- Seeded random instance

## chaos()

```typescript
function chaos<T>(
  source: AsyncIterable<T>,
  configs: ChaosConfig[],
  rng: SeededRandom,
  registry?: ChaosRegistry<T>,
): AsyncIterable<T>
```

Composes multiple chaos transformer configs into a single pipeline. Applies transformers in order using the provided registry (defaults to the built-in registry).

### ChaosConfig

```typescript
interface ChaosConfig {
  type: string
  params: Record<string, unknown>
}
```

### ChaosRegistry

```typescript
type ChaosRegistry<T> = Record<
  string,
  (source: AsyncIterable<T>, params: Record<string, unknown>, rng: SeededRandom) => AsyncIterable<T>
>
```

A map of transformer names to factory functions.

## builtinChaosRegistry

```typescript
const builtinChaosRegistry: ChaosRegistry<unknown>
```

The default registry containing all six built-in transformers. Extend it to add custom transformers:

```typescript
const myRegistry: ChaosRegistry<MyEvent> = {
  ...builtinChaosRegistry,
  my_transformer: (source, params, rng) => myTransformer(source, params, rng),
}
```

### Registered Types and Default Params

| Type        | Params                             | Defaults             |
| ----------- | ---------------------------------- | -------------------- |
| `drop`      | `{ rate: number }`                 | `rate: 0.2`          |
| `reorder`   | `{ windowSize: number }`           | `windowSize: 5`      |
| `duplicate` | `{ rate: number }`                 | `rate: 0.3`          |
| `burst`     | `{ burstSize: number }`            | `burstSize: 10`      |
| `init_gap`  | `{ count: number }`                | `count: 5`           |
| `delay`     | `{ minMs: number, maxMs: number }` | `minMs: 1, maxMs: 5` |
