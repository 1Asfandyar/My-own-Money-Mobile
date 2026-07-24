# Pattern Mapping & Default Values

Reference tables for Phase 2 (Classification) and Phase 5 (Apply Migrations) of the [react-native-ease-refactor skill](../SKILL.md).

## Migratable Pattern Mapping

| Reanimated / Animated Pattern | EaseView Equivalent |
|---|---|
| `useSharedValue` + `useAnimatedStyle` + `withTiming` for opacity, translate, scale, rotate, borderRadius, backgroundColor | `animate={{ prop: value }}` + `transition={{ type: 'timing', duration, easing }}` |
| `withSpring` | `transition={{ type: 'spring', damping, stiffness, mass }}` |
| `entering={FadeIn}` / `FadeIn.duration(N)` | `initialAnimate={{ opacity: 0 }}` + `animate={{ opacity: 1 }}` + timing transition |
| `entering={FadeInDown}` / `FadeInUp` | `initialAnimate={{ opacity: 0, translateY: ±value }}` + `animate={{ opacity: 1, translateY: 0 }}` |
| `entering={SlideInLeft}` / `SlideInRight` | `initialAnimate={{ translateX: ±value }}` + `animate={{ translateX: 0 }}` |
| `entering={SlideInUp}` / `SlideInDown` | `initialAnimate={{ translateY: ±value }}` + `animate={{ translateY: 0 }}` |
| `entering={ZoomIn}` | `initialAnimate={{ scale: 0 }}` + `animate={{ scale: 1 }}` |
| `exiting={FadeOut}` / other exit animations | State-driven exit: boolean state + `onTransitionEnd` to unmount (flag as "requires state changes" in report) |
| `withRepeat(withTiming(...), -1, false)` | `transition={{ type: 'timing', ..., loop: 'repeat' }}` + `initialAnimate` for start value |
| `withRepeat(withTiming(...), -1, true)` | `transition={{ type: 'timing', ..., loop: 'reverse' }}` + `initialAnimate` for start value |
| `Easing.linear` | `easing: 'linear'` |
| `Easing.ease` / `Easing.inOut(Easing.ease)` | `easing: 'easeInOut'` |
| `Easing.in(Easing.ease)` | `easing: 'easeIn'` |
| `Easing.out(Easing.ease)` | `easing: 'easeOut'` |
| `Easing.bezier(x1, y1, x2, y2)` | `easing: [x1, y1, x2, y2]` |
| `Animated.Value` + `Animated.timing` | Same `animate` + `transition` pattern — convert to state-driven |
| `Animated.Value` + `Animated.spring` | `animate` + `transition={{ type: 'spring' }}` — convert to state-driven |
| `withDelay(ms, withTiming(...))` or `withDelay(ms, withSpring(...))` | `transition={{ ..., delay: ms }}` — add delay to the transition config |
| `entering={FadeIn.delay(ms)}` / any entering preset with `.delay()` | `initialAnimate` + `animate` + `transition={{ ..., delay: ms }}` |
| Different `withTiming`/`withSpring` per property in `useAnimatedStyle` | `transition={{ opacity: { type: 'timing', ... }, transform: { type: 'spring', ... } }}` (per-property map) |

## Default Value Mapping

**Critical:** Reanimated and EaseView have different defaults. Always set values explicitly to preserve original animation behavior — never rely on EaseView defaults matching Reanimated defaults.

Use `reanimatedVersion` from Phase 1 to pick the right table.

### `withSpring` → EaseView spring

Reanimated v2/v3 defaults:

| Parameter | Reanimated v2/v3 | EaseView default | Action |
|---|---|---|---|
| damping | 10 | 15 | Must set `damping: 10` |
| stiffness | 100 | 120 | Must set `stiffness: 100` |
| mass | 1 | 1 | Same — omit |

Reanimated v4 defaults:

| Parameter | Reanimated v4 | EaseView default | Action |
|---|---|---|---|
| damping | 120 | 15 | Must set `damping: 120` |
| stiffness | 900 | 120 | Must set `stiffness: 900` |
| mass | 4 | 1 | Must set `mass: 4` |

Reanimated v4 switched to a critically damped, snappy spring (no bounce) as the default; v4 recommends `duration` + `dampingRatio` over raw physics params.

If the source explicitly sets any of these values, carry them over as-is. If it relies on the Reanimated default (no explicit value), set that default explicitly on the EaseView transition.

Example — bare `withSpring(1)` with no config:

```tsx
// Before (Reanimated)
scale.value = withSpring(1);

// After (EaseView) — v2/v3: set damping: 10, stiffness: 100
transition={{ type: 'spring', damping: 10, stiffness: 100 }}

// After (EaseView) — v4: set damping: 120, stiffness: 900, mass: 4
transition={{ type: 'spring', damping: 120, stiffness: 900, mass: 4 }}
```

Duration-based spring: Reanimated v3+ also supports `withSpring(target, { duration, dampingRatio })`. If the code explicitly sets `dampingRatio`/`duration`, convert using:

$$damping = dampingRatio \times 2 \times \sqrt{stiffness \times mass}$$

### `withTiming` → EaseView timing

| Parameter | Reanimated default | EaseView default | Action |
|---|---|---|---|
| duration | 300 | 300 | Same — omit |
| easing | `Easing.inOut(Easing.quad)` | `'easeInOut'` (cubic) | Must set `easing: [0.455, 0.03, 0.515, 0.955]` |

The default easing curves are different (quadratic vs cubic). Always set the easing explicitly when the source doesn't specify one.

Example — bare `withTiming(1)` with no config:

```tsx
// Before (Reanimated)
opacity.value = withTiming(1);

// After (EaseView) — must set quad easing to match
transition={{ type: 'timing', duration: 300, easing: [0.455, 0.03, 0.515, 0.955] }}
```

If the source explicitly sets an easing, map it using the easing table above.

### `Animated.timing` (old RN API) → EaseView timing

| Parameter | RN Animated default | EaseView default | Action |
|---|---|---|---|
| duration | 500 | 300 | Must set `duration: 500` |
| easing | `Easing.inOut(Easing.ease)` | `'easeInOut'` | Same curve — omit |

### `Animated.spring` (old RN API) → EaseView spring

RN Animated uses `friction`/`tension` by default: `friction: 7`, `tension: 40`. These map to `stiffness = tension`, `damping = friction`.

| Parameter | RN Animated default | EaseView default | Action |
|---|---|---|---|
| stiffness (tension) | 40 | 120 | Must set `stiffness: 40` |
| damping (friction) | 7 | 15 | Must set `damping: 7` |
| mass | 1 | 1 | Same — omit |

## Unit Conversions

- **Rotation**: Reanimated uses `'45deg'` strings in transforms → EaseView uses `45` (number, degrees). Strip the `deg` suffix and parse to number. Radians → `radians * (180 / Math.PI)`.
- **Translation**: Both use DIPs (density-independent pixels). No conversion needed.
- **Scale**: Both use unitless multipliers. No conversion needed.
