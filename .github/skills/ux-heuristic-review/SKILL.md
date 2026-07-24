---
name: ux-heuristic-review
description: "Evaluate UI designs, screenshots, or code against Nielsen's 10 usability heuristics. Use when the user asks to review UI, check usability, audit accessibility, or shares a screenshot/component/screen for UX feedback."
---

# UX Heuristic Review

Evaluates a UI (screenshot, running app, or component code) against Nielsen's 10 usability heuristics and reports actionable, ranked findings.

## When to Use

- User asks to "review UI", "review this screen", "check usability"
- User shares a screenshot or asks to look at a rendered screen
- User points to a component/screen file and asks for UX feedback
- User asks about accessibility of a UI

## Procedure

1. **Gather the subject**: view the screenshot (`view_image`), inspect the component/screen code, or render the screen in a browser/simulator if needed to observe actual behavior (loading states, error states, focus order).
2. **Evaluate against each of the 10 heuristics** (skip a heuristic only if genuinely not applicable, and say so):
   1. Visibility of system status
   2. Match between system and the real world
   3. User control and freedom
   4. Consistency and standards
   5. Error prevention
   6. Recognition rather than recall
   7. Flexibility and efficiency of use
   8. Aesthetic and minimalist design
   9. Help users recognize, diagnose, and recover from errors
   10. Help and documentation
   - Give explicit extra scrutiny to **accessibility** (color contrast, touch target size, screen-reader labels, focus order) — treat accessibility gaps as violations of the relevant heuristic (usually #1, #5, or #9) rather than a separate category.
3. **For every violation found**, report:
   - **Heuristic violated**
   - **Reproducible steps** (what to do/observe to see the issue)
   - **Remediation recommendation** (concrete fix)
4. **Rank every issue** by user impact:
   - `P0` — blocks task completion, causes data loss, or is a hard accessibility failure
   - `P1` — causes confusion, errors, or friction but has a workaround
   - `P2` — minor polish/consistency issue
5. **Output format**: group findings by priority (P0 first), not by heuristic number, so the most impactful issues are read first. If no violations are found for a heuristic, omit it rather than listing "no issues."

## Output Template

```markdown
## UX Heuristic Review

### P0
- **[Heuristic name]**: <violation description>
  - Steps to reproduce: ...
  - Recommendation: ...

### P1
- ...

### P2
- ...
```
