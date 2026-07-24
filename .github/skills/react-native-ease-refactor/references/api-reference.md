# EaseView API Reference

Reference for Phase 5 (Apply Migrations) of the [react-native-ease-refactor skill](../SKILL.md). Use this to ensure prop names, types, and defaults are correct in migrated code.

## Supported Animatable Properties (`animate` prop)

| Property | Type | Default | Notes |
|---|---|---|---|
| `opacity` | number | 1 | 0–1 range |
| `translateX` | number | 0 | In DIPs (density-independent pixels) |
| `translateY` | number | 0 | In DIPs |
| `scale` | number | 1 | Shorthand for `scaleX` + `scaleY` |
| `scaleX` | number | 1 | Overrides `scale` for X axis |
| `scaleY` | number | 1 | Overrides `scale` for Y axis |
| `rotate` | number | 0 | Z-axis rotation in degrees |
| `rotateX` | number | 0 | X-axis rotation in degrees (3D) |
| `rotateY` | number | 0 | Y-axis rotation in degrees (3D) |
| `borderRadius` | number | 0 | In pixels |
| `backgroundColor` | ColorValue | `'transparent'` | Any RN color value |
| `borderWidth` | number | 0 | In pixels |
| `borderColor` | ColorValue | `'black'` | Any RN color value |
| `shadowOpacity` | number | 0 | 0–1 (iOS only) |
| `shadowRadius` | number | 0 | In pixels (iOS only) |
| `shadowColor` | ColorValue | `'black'` | Any RN color value (iOS only) |
| `shadowOffset` | object | `{ width: 0, height: 0 }` | `{ width, height }` (iOS only) |
| `elevation` | number | 0 | Android material shadow |

## Transition Types

Timing:

```tsx
transition={{
  type: 'timing',
  duration: 300,        // ms, default 300
  easing: 'easeInOut',  // 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | [x1,y1,x2,y2]
  delay: 0,             // ms, default 0
  loop: 'repeat',       // 'repeat' | 'reverse' — requires initialAnimate
}}
```

Spring:

```tsx
transition={{
  type: 'spring',
  damping: 15,      // default 15
  stiffness: 120,   // default 120
  mass: 1,          // default 1
  delay: 0,         // ms, default 0
}}
```

None (instant):

```tsx
transition={{ type: 'none' }}
```

## Key Props

- `animate` — target values for animated properties
- `initialAnimate` — starting values (animates to `animate` on mount)
- `transition` — animation config: a single `SingleTransition` (timing/spring/none) OR a `TransitionMap` with category keys (`default`, `transform`, `opacity`, `borderRadius`, `backgroundColor`, `border`, `shadow`)
- `onTransitionEnd` — callback with `{ finished: boolean }`
- `transformOrigin` — pivot point as `{ x: 0-1, y: 0-1 }`, default center
- `useHardwareLayer` — Android GPU optimization (boolean, default `false`)
- `className` — NativeWind / Tailwind CSS class string (requires NativeWind in the project)

## Important Constraints

- Loop requires `timing` (not `spring`) and `initialAnimate` must define the start value.
- Per-property transitions are supported — pass a `TransitionMap` with category keys (`default`, `transform`, `opacity`, `borderRadius`, `backgroundColor`, `border`, `shadow`) to use different configs per property group.
- No animation sequencing — no equivalent to `withSequence`. Simple `withDelay` IS supported via the `delay` transition prop.
- No gesture/scroll-driven animations — EaseView is state-driven only.
- Style/animate conflict — if a property appears in both `style` and `animate`, the animated value wins.
