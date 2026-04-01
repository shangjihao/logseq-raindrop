# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Logseq Raindrop is a Logseq plugin built with React, TypeScript, Vite, and TailwindCSS. It uses the `@logseq/libs` SDK to integrate with Logseq's plugin API. The project was bootstrapped from the `logseq-plugin-template-react` template.

## Commands

- **Install dependencies:** `pnpm install` (pnpm is enforced via `preinstall` script; npm/yarn will fail)
- **Dev server with HMR:** `pnpm dev`
- **Build:** `pnpm build` (runs `tsc && vite build`, outputs to `dist/`)
- **Lint:** `npx eslint src/` (no dedicated lint script in package.json)

## Architecture

- **Entry point:** `src/main.tsx` — initializes the Logseq plugin via `logseq.ready()`, registers a toolbar UI item, renders the React app into the plugin's main UI panel
- **`src/App.tsx`** — root React component; uses `useAppVisible()` to show/hide the plugin UI overlay
- **`src/utils.ts`** — custom hooks for Logseq plugin events; `useAppVisible` bridges Logseq's `ui:visible:changed` event to React via `useSyncExternalStore`
- **`src/index.css`** — TailwindCSS entry (PostCSS + Autoprefixer configured)

The plugin renders as a full-screen overlay (`fixed inset-0`) with backdrop blur. Clicking outside the inner content calls `logseq.hideMainUI()` to dismiss it.

## Key Conventions

- **Package manager:** pnpm only
- **Commit style:** Conventional Commits (used by semantic-release for automated versioning)
- **Plugin ID:** defined in `package.json` under `logseq.id`
- **Releases:** semantic-release via GitHub Actions (manual trigger), zips `dist/` with metadata for Logseq marketplace distribution
- **Vite plugin:** `vite-plugin-logseq` enables HMR during development within Logseq

## TypeScript Config

- Strict mode enabled
- Target: ESNext, JSX: react
- `@typescript-eslint` with relaxed rules: `ban-ts-comment` and `no-non-null-assertion` are off
