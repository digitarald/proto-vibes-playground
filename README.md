# Proto Vibes Playground

[![Deploy to GitHub Pages](https://github.com/digitarald/proto-vibes-playground/actions/workflows/deploy.yml/badge.svg)](https://github.com/digitarald/proto-vibes-playground/actions/workflows/deploy.yml)

A curated collection of standalone prototypes built with Next.js. Each prototype lives in its own folder, is auto-discovered at build time, and rendered in a browsable catalog on GitHub Pages.

## Quick Start

Run `/setup` in Copilot Chat to install dependencies and get the dev server running.

## Adding a Prototype

Ask Copilot to create a new prototype — describe what you want to build and it will scaffold the folder, metadata, and starter page for you. The index updates automatically on build.

Each prototype lives in `src/app/prototypes/<slug>/` with a `meta.json` and a `page.tsx`. No imports to add, no config to touch.

## How It Works

- **Build-time discovery**: A `prebuild` script scans `src/app/prototypes/*/meta.json` and generates `src/generated/prototypes-index.json`.
- **Static export**: The site is exported as static HTML/CSS/JS (`output: 'export'`) and deployed to GitHub Pages.
- **Prototype isolation**: Each prototype is a Next.js route under `/prototypes/[slug]/`. They share Tailwind CSS and the router, but are otherwise self-contained.

## Deployment

Push to `main` — the GitHub Actions workflow builds and deploys to GitHub Pages automatically.
