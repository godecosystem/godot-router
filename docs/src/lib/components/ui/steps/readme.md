# Steps Component

A multi-part component system for displaying step-by-step processes or instructions.

## Files

- `steps.svelte`: Main container component that manages the overall steps layout
- `steps-step.svelte`: Individual step container (wraps step number / indicator and content)
- `steps-title.svelte`: Title / heading for a step
- `steps-body.svelte`: Content body for a step
- `steps-context.svelte.ts`: Manages `StepsContext` for auto-incrementing step numbers across `steps-step.svelte` components
- `index.ts`: Barrel export for easy importing all steps components
