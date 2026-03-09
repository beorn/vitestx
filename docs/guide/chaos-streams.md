# Chaos Streams

Composable async iterable transformers that simulate unreliable delivery. They sit between `gen()` and `take()` -- or between any async iterables.

```typescript
import { gen, take } from "vitestx"
import { drop, reorder, duplicate } from "vitestx/chaos"

const events = gen(eventPicker)
const unreliable = reorder(drop(events, 0.2, rng), 5, rng)
for await (const event of take(unreliable, 200)) {
  await process(event)
}
```

## Transformers

### drop

Skip items with a given probability. Simulates message loss, queue overflow, network drops.

```typescript
import { drop } from "vitestx/chaos"

const lossy = drop(source, 0.2, rng) // 20% drop rate
```

### reorder

Buffer items and shuffle them. Simulates out-of-order delivery.

```typescript
import { reorder } from "vitestx/chaos"

const shuffled = reorder(source, 5, rng) // Buffer 5 items, then shuffle and yield
```

### duplicate

Yield items twice with a given probability. Simulates at-least-once delivery.

```typescript
import { duplicate } from "vitestx/chaos"

const duped = duplicate(source, 0.1, rng) // 10% chance of duplicate
```

### burst

Collect items into batches, then yield all at once. Simulates bursty delivery or batched packets.

```typescript
import { burst } from "vitestx/chaos"

const bursty = burst(source, 10) // Collect 10 items, yield all at once
```

### initGap

Skip the first N items. Simulates missed events during initialization or late subscriber.

```typescript
import { initGap } from "vitestx/chaos"

const late = initGap(source, 5) // Skip first 5 items
```

### delay

Add random delay before each item. Simulates slow I/O or network latency.

```typescript
import { delay } from "vitestx/chaos"

const slow = delay(source, 1, 50, rng) // 1-50ms delay per item
```

## Composition

Transformers compose naturally since they all take and return `AsyncIterable<T>`:

```typescript
const pipeline = delay(duplicate(reorder(drop(source, 0.2, rng), 5, rng), 0.1, rng), 1, 10, rng)
```

## chaos() Combinator

For declarative pipelines, use the `chaos()` combinator:

```typescript
import { chaos } from "vitestx/chaos"

const chaotic = chaos(
  source,
  [
    { type: "drop", params: { rate: 0.2 } },
    { type: "reorder", params: { windowSize: 5 } },
    { type: "duplicate", params: { rate: 0.1 } },
  ],
  rng,
)
```

### Built-in Registry

The `chaos()` combinator ships with all six transformers registered:

| Type        | Params                             | Default         |
| ----------- | ---------------------------------- | --------------- |
| `drop`      | `{ rate: number }`                 | `rate: 0.2`     |
| `reorder`   | `{ windowSize: number }`           | `windowSize: 5` |
| `duplicate` | `{ rate: number }`                 | `rate: 0.3`     |
| `burst`     | `{ burstSize: number }`            | `burstSize: 10` |
| `init_gap`  | `{ count: number }`                | `count: 5`      |
| `delay`     | `{ minMs: number, maxMs: number }` | `1ms, 5ms`      |

## Custom Registries

Extend the built-in registry with domain-specific transformers:

```typescript
import { chaos, builtinChaosRegistry, type ChaosRegistry } from "vitestx/chaos"

const fsRegistry: ChaosRegistry<FsEvent> = {
  ...builtinChaosRegistry,
  atomic_save: (s, p, rng) => atomicSave(s, (p.rate as number) ?? 0.5, rng),
  coalesce: (s, p, rng) => coalesce(s, (p.threshold as number) ?? 10, rng),
}

const chaotic = chaos(source, configs, rng, fsRegistry)
```
