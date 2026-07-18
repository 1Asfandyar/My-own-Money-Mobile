---
name: react-native-ease-refactor
description: 'Migrate react-native-reanimated and React Native built-in Animated API code to react-native-ease EaseView components. Use when asked to migrate/refactor/convert animations to react-native-ease or EaseView, or when working with withTiming, withSpring, withRepeat, withDelay, useSharedValue, useAnimatedStyle, Animated.Value, Animated.timing, Animated.spring, or entering/exiting presets like FadeIn, SlideInLeft, ZoomIn.'
argument-hint: 'optional: file or folder path to scope the migration to'
---

# React Native Ease Refactor

A migration workflow that converts `react-native-reanimated` and React Native's built-in `Animated` API code to `react-native-ease` `EaseView` components.

Follow these 6 phases **in order**. Do not skip a phase or reorder them. Do not apply any code changes before Phase 5.

## Phase 1: Discovery

1. Detect NativeWind: grep for `from ['"]nativewind['"]` in `**/*.{ts,tsx,js,jsx}` and check `package.json` dependencies. If found, set `usesNativeWind = true` (needed in Phase 5).
2. Detect the Reanimated version from `package.json` (`dependencies` or `devDependencies`):
   - `^4` or `>=4.0.0` → `reanimatedVersion = 4`
   - otherwise → `reanimatedVersion = 3` (covers v2/v3, same defaults)
3. Grep for Reanimated usage: `from ['"]react-native-reanimated['"]`.
4. Grep for built-in Animated usage: files importing from `'react-native'` that also match `Animated\.View|Animated\.Text|Animated\.Image|Animated\.Value|Animated\.timing|Animated\.spring`.
5. Grep for files already using `from ['"]react-native-ease['"]` to avoid re-migrating them.
6. Read every file with a match and build a list of components with their animation patterns.
7. Exclude `node_modules`, `*.test.*`, `*.spec.*`, and build output dirs (`lib/`, `build/`, `dist/`).

## Phase 2: Classification

For each component found, classify as **migratable** or **not migratable** using the decision tree below (first match wins). Full pattern-mapping and default-value tables are in [pattern-mapping.md](./references/pattern-mapping.md) — load it before writing the Phase 3 report.

### Decision Tree (apply in order)

1. Uses gesture APIs (`Gesture.Pan`, `Gesture.Pinch`, `Gesture.Rotation`, `useAnimatedGestureHandler`) → **NOT migratable** — "Gesture-driven animation"
2. Uses scroll handler (`useAnimatedScrollHandler`, `onScroll` with `Animated.event`) → **NOT migratable** — "Scroll-driven animation"
3. Uses shared element transitions (`sharedTransitionTag`) → **NOT migratable** — "Shared element transition"
4. Uses `runOnUI` or worklet directives → **NOT migratable** — "Requires worklet runtime"
5. Uses `withSequence` → **NOT migratable** — "Animation sequencing not supported"
   - `withDelay` wrapping a single `withTiming`/`withSpring` → **MIGRATABLE** — map to `delay` on the transition
   - `withDelay` wrapping `withSequence` or nested `withDelay` → **NOT migratable** — "Complex delay/sequencing not supported"
6. Uses complex `interpolate()` (more than 2 input/output values) → **NOT migratable** — "Complex interpolation"
7. Uses `layout={...}` prop → **NOT migratable** — "Layout animation"
8. Animates an unsupported property (anything other than: `opacity`, `translateX`, `translateY`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `borderRadius`, `backgroundColor`, `borderWidth`, `borderColor`, `shadowOpacity`, `shadowRadius`, `shadowColor`, `shadowOffset`, `elevation`) → **NOT migratable** — "Animates unsupported property: `<prop>`"
9. Uses different transition configs per property (e.g. opacity uses 200ms timing, scale uses spring) → **MIGRATABLE** — map to a `TransitionMap` with category keys (`transform`, `opacity`, `borderRadius`, `backgroundColor`, `border`, `shadow`, `default`)
10. Not driven by React state (animation driven directly by a gesture/scroll value, not state) → **NOT migratable** — "Not state-driven"
11. Otherwise → **MIGRATABLE**

Use the pattern-mapping table and default-value mapping tables in [pattern-mapping.md](./references/pattern-mapping.md) to work out exact `animate`/`initialAnimate`/`transition` props for each migratable component.

## Phase 3: Dry-Run Report

**Always** print this report as visible text output before asking the user anything. Do not apply any changes yet.

```
## Migration Report

### Summary
- Files scanned: X
- Components with animations: Y
- Migratable: Z  |  Not migratable: W

### Migratable Components

#### `path/to/file.tsx` — ComponentName
**Current:** Brief description of what the animation does and which API it uses
**Proposed:** What the EaseView equivalent looks like (include exact transition values with mapped defaults)
**Changes:** What will be added/removed/modified
**Note:** (only if applicable) "Requires state changes for exit animation" or other caveats

### Not Migratable (will be skipped)

#### `path/to/file.tsx` — ComponentName
**Reason:** Why it can't be migrated (from decision tree)
```

## Phase 4: User Confirmation

**Critical:** use the question-asking tool directly (e.g. `vscode_askQuestions`). Do not use plan mode, do not ask inline in prose, do not skip this phase.

Ask a single multi-select question:
- header: `Migrate`
- question: "Which components should be migrated to EaseView? All are selected — deselect any to skip."
- one option per migratable component: label = component name, description = file path + brief animation description

Wait for the response before proceeding — do not enter plan mode and do not apply changes without confirmation.

If the user selects nothing or cancels, abort with: "Migration aborted. No changes were made." Otherwise proceed to Phase 5 only with the confirmed components.

## Phase 5: Apply Migrations

Full EaseView prop/type reference is in [api-reference.md](./references/api-reference.md) — load it before editing files.

For each confirmed component:

1. Add the import if missing: `import { EaseView } from 'react-native-ease';`
2. If `usesNativeWind` is true, check whether any file already has `import 'react-native-ease/nativewind'`. If not, add it once to the app's earliest entry point (e.g. `src/app/_layout.tsx`). Only needs doing once total, not per component.
3. Replace `Animated.View`/`Animated.Text`/`Animated.Image` with `EaseView`, moving animated style values into `animate`/`initialAnimate`/`transition` props instead of a `style={[..., animatedStyle]}` array.
4. Remove `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring`, `withRepeat` calls that are fully replaced; convert their values into `animate`, `initialAnimate`, and `transition` props using the mapping tables.
5. Convert `entering`/`exiting` presets:
   - `entering={FadeIn}` → `initialAnimate={{ opacity: 0 }}` + `animate={{ opacity: 1 }}`
   - For exit animations, introduce state + `onTransitionEnd` to unmount:
     ```tsx
     const [visible, setVisible] = useState(true);
     const [mounted, setMounted] = useState(true);

     // trigger exit:
     setVisible(false);

     {mounted && (
       <EaseView
         animate={{ opacity: visible ? 1 : 0 }}
         transition={{ type: 'timing', duration: 300 }}
         onTransitionEnd={({ finished }) => {
           if (finished && !visible) setMounted(false);
         }}
       >
         ...
       </EaseView>
     )}
     ```
6. Clean up imports: remove Reanimated/Animated imports no longer used in the file; keep any still referenced by non-migrated code in the same file. Check every remaining line for references before removing an import.
7. Print progress per component: `[i/N] Migrated ComponentName in path/to/file.tsx`

### Safety Rules (non-negotiable)

- When in doubt, skip. Ambiguous or low-confidence patterns go to "Not Migratable" with reason "Complex pattern — manual review recommended".
- Never remove an import still used elsewhere in the file.
- Preserve all non-animation logic (event handlers, state, effects, callbacks) untouched unless directly tied to the animation being migrated.
- Preserve component structure and public API: props, ref forwarding, exported types stay identical.
- Mixed files: only migrate the safe animations; keep Reanimated imports if any Reanimated code remains.
- Rotation units: Reanimated `'45deg'` string → EaseView `45` (number, degrees). Radians → `radians * (180 / Math.PI)`.
- Map easing presets using the table in [pattern-mapping.md](./references/pattern-mapping.md).
- Do not introduce TypeScript errors; ensure EaseView prop types match the original typed values.

## Phase 6: Final Report

```
## Migration Complete

### Changed (X components)
- `path/to/file.tsx` — ComponentName: brief description of what was migrated

### Unchanged (Y components)
- `path/to/file.tsx` — ComponentName: reason skipped

### Next Steps
- Run your app and verify animations visually
- Run your test suite to check for regressions
- If no Reanimated code remains, consider removing `react-native-reanimated` from dependencies
```
