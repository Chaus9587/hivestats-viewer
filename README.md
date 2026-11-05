# Statistics viewer for The Hive: A Minecraft Bedrock server

Deployed on Netlify: https://chaus9587-hivestats-viewer.netlify.app/

## Overview

This is a Web application for checking profiles statistics in Minecraft Bedrock "The Hive" Server, developed in Vue 3 and built by Vite 8. It fetches data from "The Hive" official API, and returns a player's detailed game statistics, cosmetics, etc.

## Features

- **Detailed statistics**: Capable of calculating extra statistics for combat minigames (e.g. K/D Ratio, Avg. kills/deaths per game).
- **Cached player data**: Statistics fetched are saved to localStorage, so users can load previously fetched players' statistics without calling extra API requests, which reduce the chance of exceeding API request limit per hour for a player.

## Methodology and Tools used

- **Framework:** [Vue 3](https://vuejs.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Data Source:** [The Hive Public API](https://api.playhive.com/)
- **Hosting & CI/CD:** [Netlify](https://www.netlify.com/)

## Project Structure

```text
hivestats-viewer/
├── public/
│   ├── _redirects               # Netlify SPA rewrite rule (/* /index.html 200)
│   └── favicon.ico
├── src/
│   ├── assets/                  # SVG icons and static assets
│   ├── components/
│   │   ├── Card.vue             # Collapsible game mode statistics card
│   │   ├── CosmeticCard.vue     # Reusable expandable wrapper for cosmetics
│   │   └── PlayerStat.vue       # Main player search & stats dashboard view
│   ├── composables/
│   │   ├── gameCode.js          # Game metadata, combat flags, & monthly support
│   │   ├── parseMcText.js       # Minecraft Bedrock color code & hex parser
│   │   ├── useHiveStats.js      # API fetching, stat schemas, Parkour parser & caching
│   │   └── usePlayerSearch.js   # URL routing, search state, & cosmetic pagination
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

## Reminders

Node.js (>= v18 recommended), npm are required for local development.

After a git clone, in the project folder terminal, use the command:

```bash
npm install
```

to install the packages listed in package.json, which is required to run this web application.

Use the command:

```bash
npm run dev
```

to start a development server.

## Disclaimer

This project is an independent fan-made tool and is not affiliated with, endorsed, or sponsored by The Hive (playhive.com), Mojang Studios, or Microsoft.




