---
name: setup
description: "Set up the development environment for the playground. Use when the user wants to install dependencies, fix environment issues, or get the project running for the first time. Works on macOS, Windows, and WSL."
user-invocable: true
---

# Environment Setup

Check and install all required dependencies so the playground runs locally. Supports macOS, Windows (PowerShell), and WSL/Linux.

## Procedure

### 1. Check Node.js

Run `node --version`. The project requires Node.js 20+.

If missing or too old, install it using the appropriate method for the user's OS:
- **macOS**: `brew install node` (or suggest nvm)
- **Linux/WSL**: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`, or suggest nvm
- **Windows**: suggest `winget install OpenJS.NodeJS.LTS`

### 2. Check npm

Run `npm --version`. npm ships with Node.js — if Node is installed, npm should be available.

If npm is missing despite Node being present, suggest reinstalling Node.

### 3. Install project dependencies

```bash
npm install
```

Verify it completes without errors. If it fails:
- Check for network issues (proxy, VPN)
- Try `npm install --legacy-peer-deps` if there are peer dependency conflicts
- On permission errors in Linux/WSL, do **not** use `sudo npm install` — fix the npm prefix instead

### 4. Verify the build

```bash
npm run build
```

If this succeeds, the environment is fully working.

### 5. Start the dev server

Start the `dev` task using `run_task` with the `shell: dev` task, then open `http://localhost:3000` in the integrated browser to confirm everything is running.
