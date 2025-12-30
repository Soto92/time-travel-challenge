# Aeon Temporal Navigation — Deterministic Two-Window Solution

## Overview

This document describes the **final solution** to Aeon’s spacetime navigation problem.

Aeon is a traveler capable of limited movement in space, but **cannot freely reposition across astronomical distances**.  
Because of this limitation, time travel must account not only for _when_ Aeon arrives, but also _where the Earth will be_ at that moment in space.

The solution presented here guarantees **safe, predictable, and deterministic results** for every request.

---

## Core Assumptions

### Aeon’s Capabilities

- Aeon can:
  - Move locally on Earth (several kilometers)
  - Compensate for small spatial offsets
- Aeon **cannot**:
  - Teleport across large orbital or interstellar distances
  - Precisely match Earth’s position across time

### Reference Frame

- Earth’s motion is evaluated **relative to its own orbital path**
- No absolute or fixed universal coordinate system is required

---

## ⚠️ Important Note — No Spatial Coordinates Used

This solution **does NOT use explicit spatial coordinates** such as:

- X, Y, Z positions
- Galactic coordinates
- Absolute heliocentric or barycentric vectors

Instead, the system relies on:

- **Relative orbital alignment**
- **Temporal proximity**
- **Acceptable spatial tolerance envelopes**

The city (or its geographic location) is used **only to define a local arrival radius on Earth**, not as a precise destination in space.

This approach avoids:

- The need for a universal reference frame
- Infinite precision requirements
- Coordinate drift paradoxes

---

## Problem Constraints

When Aeon requests a target year:

- Earth will **not** occupy the same position in space
- Exact spacetime alignment is impossible
- A tolerance envelope must be respected

Additionally:

- A city (or its coordinates) defines a **regional landing envelope**, allowing Aeon to arrive _near_ the intended destination rather than at an exact point.

---

## Solution Strategy

### Deterministic Window Selection

Instead of attempting to find a “perfect” match (which may not exist), the system:

1. Evaluates nearby temporal candidates
2. Estimates **relative spatial drift** using orbital continuity
3. Scores each candidate based on:
   - Temporal distance
   - Relative orbital misalignment
4. **Always returns exactly two valid alternatives**:
   - The closest viable year **before** the requested year
   - The closest viable year **after** the requested year

This guarantees:

- No failure states
- No empty responses
- Predictable behavior

---

## Scoring Model

Each candidate is evaluated using a continuous score:

```

score = temporalDeviation × weight + orbitalDriftFactor

```

Where:

- `temporalDeviation` = absolute difference from requested year
- `orbitalDriftFactor` = normalized estimate of Earth’s orbital offset
- `weight` = penalty applied to time deviation

Lower scores represent safer jumps.

---

## Guaranteed Outcome

The system **never returns failure**.

For any valid request, it always responds with:

- One **past** alternative
- One **future** alternative

Even if both involve risk, Aeon is always given a choice.

---

## Example Output

```json
{
  "status": "OK",
  "requestedYear": 1970,
  "city": "Gravataí, RS, Brazil",
  "safeTemporalWindows": [
    {
      "year": 1969,
      "temporalErrorYears": -1,
      "relativeOrbitalOffset": "low",
      "score": 0.18
    },
    {
      "year": 1972,
      "temporalErrorYears": 2,
      "relativeOrbitalOffset": "moderate",
      "score": 0.31
    }
  ]
}
```

---

## Design Principles

- **No absolute coordinates**
- **Determinism over chance**
- **Always-return policy**
- **Relative safety, not perfection**
- **User choice instead of system refusal**

---

## Narrative Interpretation

> _Time does not offer certainty — only options._

> _Aeon is never denied passage._

> _He must simply choose which deviation he is willing to endure._

---

## Status

✔ Stable

✔ Predictable

✔ Coordinate-free

✔ No failure paths

✔ Suitable for simulation, storytelling, or hard-science fiction systems
