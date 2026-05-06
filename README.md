# Base Gas Checker

Base Gas Checker is a clean mini app and web app for checking live Base L2 gas price in a fast, readable interface.

**Live app:** https://basegaschecker.vercel.app

---

## Overview

Base Gas Checker shows the current Base gas price in **gwei** with a simple status gauge, auto-refresh controls, and a small history chart of recent checks.

The app is designed for quick gas monitoring inside the Base/Farcaster mini app experience, while still working as a regular web app in the browser.

## Features

- Live Base L2 gas price display
- Gas value shown in gwei with readable formatting
- Status label for current gas mood: **Cheap**, **Normal**, or **Hot**
- Auto-refresh options from 5 seconds to 60 seconds
- Manual refresh button for instant updates
- Recent gas history chart using the latest 30 samples
- Min and max values from recent checks
- Copy gas summary to clipboard
- Share current gas status through Farcaster cast composer when available
- Add-to-apps action for supported mini app hosts
- Base/Farcaster mini app embed metadata
- Static splash, icon, hero, and embed assets for mini app previews

## Supported chain

- Base Mainnet

## Gas price behavior

The app fetches the current Base gas price through a server-side API route.

The API route connects to Base Mainnet RPC, reads the current gas price in wei, converts it to gwei, and returns the result with a fresh timestamp. The response is not cached, so each refresh requests a current value.

## Tech stack

- Next.js 14
- React 18
- TypeScript
- viem
- Farcaster Mini App SDK
- CSS

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Build for production

```bash
npm run build
npm run start
```

## License

This project is licensed under the [MIT License](./LICENSE).
