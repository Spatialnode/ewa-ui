<p align="center">
  <img src="https://img.shields.io/badge/Ewa%20UI-React%20Component%20Library-blue?style=for-the-badge&logo=react&logoColor=white" alt="Ewa UI"/>
</p>

<h1 align="center">🎨 Ẹwà UI</h1>

<p align="center">
  <strong>Spatialnode's shared React component library</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/%40spatialnode%2Fewa-ui?style=flat-square&color=CB3837&logo=npm&logoColor=white" alt="npm version"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Radix%20UI-161618?style=flat-square&logo=radixui&logoColor=white" alt="Radix UI"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Storybook-FF4785?style=flat-square&logo=storybook&logoColor=white" alt="Storybook"/>
</p>

<p align="center">
  <a href="#requirements">Requirements</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#testing">Testing</a> •
  <a href="#publishing">Publishing</a> •
  <a href="#contributing">Contributing</a>
</p>

---

Spatialnode's React component library is a set of shared, reusable UI components built with React, Radix UI, and Tailwind CSS. It's distributed as [`@spatialnode/ewa-ui`](https://www.npmjs.com/package/@spatialnode/ewa-ui) on npm.

## Requirements

- Node.js `>=20`
- [pnpm](https://pnpm.io/) `10.27.0` (managed via `packageManager` in `package.json` — use [Corepack](https://nodejs.org/api/corepack.html) to pick it up automatically)

```bash
corepack enable
```

## Getting Started

1. **Clone the repository**

   ```bash
   git clone git@github.com:Spatialnode/ewa-ui.git
   cd ewa-ui
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start Storybook** to develop and preview components in isolation

   ```bash
   pnpm storybook
   ```

   Storybook runs at [http://localhost:6006](http://localhost:6006).

## Project Structure

```
ewa-ui/
├── .storybook/          # Storybook configuration
├── src/
│   ├── components/
│   │   ├── ui/           # Base/primitive components
│   │   └── custom/       # Composed/higher-level components
│   ├── stories/          # Storybook stories and example assets
│   ├── lib/              # Shared utilities (e.g. `cn` helper)
│   └── index.ts          # Public package entry point / exports
├── dist/                 # Build output (generated, not committed)
├── tsdown.config.ts      # Build configuration (tsdown)
├── vitest.config.ts      # Test configuration
└── tsconfig.json         # TypeScript configuration
```

New components should be added under `src/components/ui` (primitives) or `src/components/custom` (composed components), then re-exported from `src/index.ts` to be included in the published package.

## Available Scripts

| Script                    | Description                                      |
| ------------------------- | ------------------------------------------------- |
| `pnpm build`               | Bundles the library to `dist/` using tsdown       |
| `pnpm test`                | Runs the test suite once (Vitest)                 |
| `pnpm test:watch`          | Runs the test suite in watch mode                 |
| `pnpm typecheck`           | Type-checks the project without emitting output   |
| `pnpm storybook`           | Starts Storybook in dev mode on port 6006         |
| `pnpm build-storybook`     | Builds a static Storybook site to `storybook-static/` |

## Development Workflow

1. Create a branch off `main`:

   ```bash
   git checkout -b feat/component-name
   ```

2. Build your component under `src/components/ui` or `src/components/custom`, using [`class-variance-authority`](https://cva.style/docs) and the shared `cn` utility (`src/lib/utils.ts`) for variant/class handling, consistent with existing components (see `src/components/ui/button.tsx`).

3. Add a Storybook story alongside the component (`*.stories.tsx`) and verify it renders correctly via `pnpm storybook`.

4. Export the component from `src/index.ts`.

5. Add/update tests, run type checking, and confirm everything passes locally before opening a PR:

   ```bash
   pnpm typecheck
   pnpm test
   ```

6. Open a pull request against `main` for review.

## Testing

Tests run via [Vitest](https://vitest.dev/), with browser-mode component tests powered by Playwright and the Storybook addon.

```bash
pnpm test         # run once
pnpm test:watch   # watch mode
```

## Building

```bash
pnpm build
```

This runs `tsdown`, which bundles `src/index.ts` into ESM and CJS output with type declarations in `dist/`, and validates the package output with [`publint`](https://publint.dev/).

## Publishing

Ewa UI is published to npm under the `@spatialnode` organization as [`@spatialnode/ewa-ui`](https://www.npmjs.com/package/@spatialnode/ewa-ui).

```bash
pnpm build
npm publish --access public
```

Ensure you're logged in to npm (`npm login`) with an account that belongs to the `spatialnode` org before publishing.

## Contributing

- Follow the existing code style and component patterns (Radix primitives, `cva` for variants, Tailwind for styling).
- Every component change should include a corresponding Storybook story.
- Run `pnpm typecheck` and `pnpm test` before pushing.
- Keep pull requests focused and scoped to a single component or change.
