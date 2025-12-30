# The Aeon Constraint

### A Spacetime Navigation Problem by Mauricio Soto

## Overview

Aeon is a user with a rare and dangerous ability:  
he can move through **time**, but only has **limited control over space**.

Unlike traditional time travelers, Aeon cannot freely choose _where_ he appears.  
If he selects the wrong moment, he risks materializing in empty space, inside a star,  
or thousands of kilometers away from his intended destination.

![alt](./demo.png)

## Aeon’s Ability

- ✅ Aeon can move **forward or backward in time**
- ⚠️ Aeon can only adjust his **spatial position slightly**
- 🌌 His spatial control is sufficient to:
  - Follow the general motion of the **Milky Way**
  - Compensate for large-scale galactic movement
- ❌ He cannot:
  - Precisely teleport to an exact spatial coordinate
  - Instantly correct large spatial mismatches

---

## The Fundamental Problem

Time and space are inseparable.

When Aeon attempts to travel to a specific **year** and **city**, several risks arise:

- The Earth is constantly moving:
  - Orbiting the Sun
  - Traveling with the Solar System
  - Moving within the Milky Way
- A target year does **not guarantee** that:
  - The Earth occupies a compatible position
  - The chosen city aligns with Aeon’s spatial trajectory

As a result, a naïve jump to a specific year can place Aeon:

- In the vacuum of space
- In a different city than intended
- In a location that did not physically exist at that time

---

## Input Constraints

Aeon can only express his intent as:

- **City** (semantic location, e.g. a known human settlement)
- **Year** (past or future)

He cannot specify:

- Absolute spatial coordinates
- Orbital parameters
- Reference frames or vectors

---

## Desired Outcome

Aeon does **not** need a perfect match.

What he needs is:

- A way to identify **safe temporal windows**
- Moments close to his desired year where:
  - The Earth’s position is compatible
  - The target city aligns with his limited spatial tolerance
  - The risk of spatial misplacement is minimized

These windows may occur **before or after** the requested year  
and must accept a margin of temporal error.

---

## Core Challenge

> How can Aeon be guided toward _safe moments in time_  
> when he cannot precisely control space  
> and when Earth itself never stops moving?

This challenge exists at the intersection of:

- Time travel constraints
- Astronomical motion
- Reference frames
- Human-scale geography versus cosmic-scale movement
