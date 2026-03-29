/**
 * Cognitive OS — Database Seed
 * 30 real GitHub developers with real repos, realistic issues/PRs, and 30-day analytics
 * All GitHub IDs, repo IDs, and profile data sourced from the GitHub API
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

interface IssueData {
  id: number;
  n: number;
  title: string;
  body: string;
  complexity: number;
  priority: number;
  labels: string[];
  comments: number;
  state: string;
}

interface PRData {
  id: number;
  n: number;
  title: string;
  additions: number;
  deletions: number;
  files: number;
  reviews: number;
  state: string;
}

interface RepoData {
  githubId: number;
  name: string;
  fullName: string;
  url: string;
  desc: string;
  lang: string;
  stars: number;
  issues: IssueData[];
  prs: PRData[];
}

interface UserData {
  githubId: number;
  login: string;
  name: string;
  email: string;
  avatar: string;
  repos: RepoData[];
}

const USERS: UserData[] = [
  // ─── 1. Anthony Fu ─────────────────────────────────────────
  {
    githubId: 11247099, login: "antfu", name: "Anthony Fu",
    email: "antfu7@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/11247099?v=4",
    repos: [
      {
        githubId: 197451023, name: "eslint-config", fullName: "antfu/eslint-config",
        url: "https://github.com/antfu/eslint-config",
        desc: "Anthony's ESLint config preset — flat config, TypeScript, Vue, React",
        lang: "JavaScript", stars: 6061,
        issues: [
          { id: 10001, n: 612, title: "Support for ESLint v9 flat config migration guide", body: "Need comprehensive docs on migrating from legacy .eslintrc to flat config.", complexity: 5, priority: 3, labels: ["documentation", "v9"], comments: 18, state: "open" },
          { id: 10002, n: 608, title: "Vue template indentation rules conflict with Prettier", body: "When using the Vue plugin alongside Prettier, template indentation rules create conflicts.", complexity: 6, priority: 4, labels: ["bug", "vue", "prettier"], comments: 24, state: "open" },
          { id: 10003, n: 601, title: "Add support for Astro files", body: "With Astro's growing popularity, we need first-class .astro file support.", complexity: 7, priority: 3, labels: ["enhancement", "astro"], comments: 31, state: "open" },
          { id: 10004, n: 598, title: "TypeScript strict mode causes false positives on generics", body: "The no-unsafe-assignment rule fires incorrectly when using complex generic types.", complexity: 5, priority: 4, labels: ["bug", "typescript"], comments: 12, state: "open" },
          { id: 10005, n: 591, title: "React hooks rules not applying in .tsx files", body: "The react-hooks/rules-of-hooks rule is not being applied to .tsx files.", complexity: 4, priority: 5, labels: ["bug", "react", "critical"], comments: 8, state: "open" },
          { id: 10007, n: 579, title: "Performance regression in v2.5 — 3x slower lint times", body: "After upgrading to v2.5, lint times went from 4s to 12s on a 200-file project.", complexity: 8, priority: 5, labels: ["bug", "performance", "critical"], comments: 42, state: "open" },
        ],
        prs: [
          { id: 20001, n: 614, title: "feat: add Astro file support with astro-eslint-parser", additions: 380, deletions: 20, files: 8, reviews: 5, state: "open" },
          { id: 20002, n: 610, title: "fix: resolve Vue template indentation conflict with Prettier", additions: 95, deletions: 40, files: 4, reviews: 3, state: "open" },
          { id: 20003, n: 605, title: "perf: optimize import resolver for large TypeScript projects", additions: 220, deletions: 180, files: 6, reviews: 7, state: "open" },
          { id: 20004, n: 599, title: "docs: migration guide from legacy .eslintrc to flat config", additions: 450, deletions: 0, files: 3, reviews: 4, state: "merged" },
        ],
      },
      {
        githubId: 917547117, name: "node-modules-inspector", fullName: "antfu/node-modules-inspector",
        url: "https://github.com/antfu/node-modules-inspector",
        desc: "Interactive UI for local node modules inspection", lang: "Vue", stars: 2792,
        issues: [
          { id: 10010, n: 145, title: "Add dependency graph visualization with d3-force", body: "A force-directed graph would make it easier to spot circular dependencies.", complexity: 8, priority: 3, labels: ["enhancement", "visualization"], comments: 22, state: "open" },
          { id: 10011, n: 138, title: "Filter by license type (MIT, Apache, GPL)", body: "Enterprise users need to audit license compliance.", complexity: 4, priority: 4, labels: ["enhancement", "enterprise"], comments: 11, state: "open" },
          { id: 10012, n: 132, title: "pnpm workspaces support broken in v1.2", body: "Inspector fails to resolve workspace packages in pnpm monorepo.", complexity: 5, priority: 5, labels: ["bug", "pnpm", "monorepo"], comments: 17, state: "open" },
        ],
        prs: [
          { id: 20010, n: 147, title: "feat: d3-force dependency graph visualization", additions: 680, deletions: 45, files: 12, reviews: 4, state: "open" },
          { id: 20011, n: 141, title: "fix: pnpm workspace package resolution", additions: 120, deletions: 35, files: 5, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 424297966, name: "vitesse-nuxt", fullName: "antfu/vitesse-nuxt",
        url: "https://github.com/antfu/vitesse-nuxt",
        desc: "Vitesse for Nuxt 4 — opinionated starter template", lang: "TypeScript", stars: 1897,
        issues: [
          { id: 10020, n: 89, title: "Upgrade to Nuxt 4 stable release", body: "Nuxt 4 is now stable. Need to update all dependencies.", complexity: 6, priority: 4, labels: ["upgrade", "nuxt4"], comments: 14, state: "open" },
          { id: 10021, n: 85, title: "Add Pinia store setup with persistence", body: "Include a Pinia store example with pinia-plugin-persistedstate.", complexity: 3, priority: 2, labels: ["enhancement", "pinia"], comments: 7, state: "open" },
          { id: 10022, n: 81, title: "i18n setup broken after Nuxt 4 migration", body: "@nuxtjs/i18n v9 has breaking changes that conflict with the current setup.", complexity: 5, priority: 4, labels: ["bug", "i18n"], comments: 19, state: "open" },
        ],
        prs: [
          { id: 20020, n: 91, title: "chore: upgrade to Nuxt 4 stable with all breaking changes", additions: 340, deletions: 280, files: 18, reviews: 3, state: "open" },
          { id: 20021, n: 87, title: "fix: i18n locale auto-detection for Nuxt 4", additions: 85, deletions: 60, files: 4, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 2. Wes Bos ─────────────────────────────────────────────
  {
    githubId: 176013, login: "wesbos", name: "Wes Bos",
    email: "wesbos@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/176013?v=4",
    repos: [
      {
        githubId: 75867720, name: "JavaScript30", fullName: "wesbos/JavaScript30",
        url: "https://github.com/wesbos/JavaScript30",
        desc: "30 Day Vanilla JS Challenge — build 30 things in 30 days", lang: "HTML", stars: 29067,
        issues: [
          { id: 10030, n: 1205, title: "Day 14 LocalStorage: JSON.parse fails on empty storage", body: "JSON.parse(null) throws on first load.", complexity: 2, priority: 4, labels: ["bug", "day-14"], comments: 8, state: "open" },
          { id: 10031, n: 1198, title: "Day 22 Follow Along Nav: animation jitter on fast hover", body: "Highlight element jitters on fast mouse movement.", complexity: 4, priority: 3, labels: ["bug", "day-22", "animation"], comments: 12, state: "open" },
          { id: 10032, n: 1191, title: "Add TypeScript versions of all 30 exercises", body: "Many learners want TypeScript versions.", complexity: 9, priority: 2, labels: ["enhancement", "typescript"], comments: 45, state: "open" },
          { id: 10033, n: 1184, title: "Day 11 Custom Video Player: fullscreen API deprecated", body: "webkitRequestFullscreen is deprecated.", complexity: 2, priority: 3, labels: ["bug", "day-11"], comments: 6, state: "open" },
          { id: 10034, n: 1177, title: "Day 28 Video Speed Controller: mobile touch events missing", body: "Speed scrubber doesn't work on mobile.", complexity: 4, priority: 3, labels: ["bug", "day-28", "mobile"], comments: 9, state: "open" },
        ],
        prs: [
          { id: 20030, n: 1208, title: "fix: Day 14 localStorage empty state JSON.parse error", additions: 8, deletions: 3, files: 1, reviews: 2, state: "open" },
          { id: 20031, n: 1201, title: "fix: Day 22 nav highlight jitter with requestAnimationFrame", additions: 25, deletions: 12, files: 1, reviews: 1, state: "open" },
          { id: 20032, n: 1194, title: "feat: TypeScript versions for days 01-10", additions: 890, deletions: 0, files: 10, reviews: 4, state: "open" },
          { id: 20034, n: 1180, title: "fix: Day 28 add touch event handlers for mobile", additions: 45, deletions: 5, files: 1, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 189282896, name: "beginner-javascript", fullName: "wesbos/beginner-javascript",
        url: "https://github.com/wesbos/beginner-javascript",
        desc: "Starter files and solutions for the Beginner JavaScript course", lang: "HTML", stars: 6774,
        issues: [
          { id: 10040, n: 312, title: "Module 12: fetch API examples use deprecated syntax", body: "Several fetch examples still use .then() chains.", complexity: 3, priority: 3, labels: ["enhancement", "module-12"], comments: 7, state: "open" },
          { id: 10041, n: 308, title: "Add solution videos for modules 15-20", body: "Missing solution walkthroughs for the last 5 modules.", complexity: 2, priority: 5, labels: ["content", "missing"], comments: 34, state: "open" },
          { id: 10042, n: 302, title: "Broken starter files for Module 9 Canvas exercises", body: "Canvas starter files reference a missing utils.js file.", complexity: 2, priority: 5, labels: ["bug", "module-9", "critical"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 20040, n: 314, title: "fix: Module 9 missing utils.js canvas starter file", additions: 45, deletions: 0, files: 2, reviews: 1, state: "open" },
          { id: 20041, n: 310, title: "fix: Module 12 update fetch examples to async/await", additions: 120, deletions: 95, files: 8, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 99754954, name: "Advanced-React", fullName: "wesbos/Advanced-React",
        url: "https://github.com/wesbos/Advanced-React",
        desc: "Starter Files and Solutions for Full Stack Advanced React and GraphQL", lang: "JavaScript", stars: 3559,
        issues: [
          { id: 10050, n: 445, title: "GraphQL mutations fail after Apollo Client v3 upgrade", body: "Optimistic UI updates no longer work after upgrading to Apollo Client v3.", complexity: 7, priority: 5, labels: ["bug", "apollo", "critical"], comments: 38, state: "open" },
          { id: 10051, n: 438, title: "Migrate from Keystone 5 to Keystone 6", body: "Keystone 5 is EOL. Entire backend needs migration.", complexity: 10, priority: 4, labels: ["migration", "keystone", "breaking"], comments: 56, state: "open" },
        ],
        prs: [
          { id: 20050, n: 447, title: "fix: Apollo Client v3 cache.modify for optimistic updates", additions: 340, deletions: 220, files: 14, reviews: 6, state: "open" },
        ],
      },
    ],
  },
  // ─── 3. Kent C. Dodds ──────────────────────────────────────
  {
    githubId: 1500684, login: "kentcdodds", name: "Kent C. Dodds",
    email: "me@kentcdodds.com",
    avatar: "https://avatars.githubusercontent.com/u/1500684?v=4",
    repos: [
      {
        githubId: 338699314, name: "mdx-bundler", fullName: "kentcdodds/mdx-bundler",
        url: "https://github.com/kentcdodds/mdx-bundler",
        desc: "Give me MDX/TSX strings and I'll give you back a component you can render", lang: "JavaScript", stars: 1898,
        issues: [
          { id: 10060, n: 312, title: "esbuild 0.20 breaks CSS module imports in MDX", body: "CSS module imports inside MDX files throw errors after esbuild 0.20.", complexity: 7, priority: 5, labels: ["bug", "esbuild", "css-modules"], comments: 28, state: "open" },
          { id: 10061, n: 308, title: "Add support for MDX v3 syntax", body: "MDX v3 introduced new syntax for expressions and JSX.", complexity: 8, priority: 4, labels: ["enhancement", "mdx-v3"], comments: 34, state: "open" },
          { id: 10062, n: 302, title: "TypeScript types for bundleMDX return value are wrong", body: "The code property is typed as string but can be undefined.", complexity: 3, priority: 4, labels: ["bug", "typescript"], comments: 9, state: "open" },
          { id: 10064, n: 291, title: "Memory leak when bundling large MDX files repeatedly", body: "Memory usage grows unbounded in Next.js apps calling bundleMDX on every request.", complexity: 7, priority: 5, labels: ["bug", "memory-leak", "performance"], comments: 45, state: "open" },
        ],
        prs: [
          { id: 20060, n: 314, title: "fix: esbuild 0.20 CSS module import resolution", additions: 180, deletions: 45, files: 5, reviews: 4, state: "open" },
          { id: 20061, n: 310, title: "feat: MDX v3 syntax support", additions: 520, deletions: 180, files: 12, reviews: 6, state: "open" },
          { id: 20062, n: 305, title: "fix: memory leak in esbuild instance lifecycle", additions: 65, deletions: 20, files: 3, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 96484031, name: "babel-plugin-macros", fullName: "kentcdodds/babel-plugin-macros",
        url: "https://github.com/kentcdodds/babel-plugin-macros",
        desc: "Allows you to build simple compile-time libraries", lang: "JavaScript", stars: 2642,
        issues: [
          { id: 10070, n: 198, title: "Babel 8 compatibility — macro resolution fails", body: "Babel 8 changed the plugin API. Current macro resolution uses deprecated methods.", complexity: 8, priority: 5, labels: ["bug", "babel-8", "breaking"], comments: 52, state: "open" },
          { id: 10071, n: 192, title: "Add SWC transform support for macros", body: "Need a way to run macros in SWC-based toolchains.", complexity: 9, priority: 3, labels: ["enhancement", "swc"], comments: 38, state: "open" },
          { id: 10072, n: 186, title: "Macro import paths not resolved in monorepos", body: "Macro imports from sibling packages fail in pnpm/yarn workspaces.", complexity: 5, priority: 4, labels: ["bug", "monorepo"], comments: 14, state: "open" },
        ],
        prs: [
          { id: 20070, n: 200, title: "fix: Babel 8 plugin API compatibility", additions: 420, deletions: 280, files: 8, reviews: 5, state: "open" },
          { id: 20071, n: 194, title: "fix: monorepo workspace symlink resolution", additions: 85, deletions: 30, files: 4, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 43512914, name: "cross-env", fullName: "kentcdodds/cross-env",
        url: "https://github.com/kentcdodds/cross-env",
        desc: "Cross platform setting of environment scripts", lang: "TypeScript", stars: 6534,
        issues: [
          { id: 10080, n: 412, title: "Windows PowerShell 7 — env vars with spaces not quoted", body: "PowerShell 7 doesn't handle quoting correctly for values with spaces.", complexity: 4, priority: 4, labels: ["bug", "windows", "powershell"], comments: 17, state: "open" },
          { id: 10081, n: 408, title: "Add support for .env file loading", body: "Add an option to load variables from a .env file.", complexity: 4, priority: 3, labels: ["enhancement"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 20080, n: 414, title: "fix: PowerShell 7 env var quoting for values with spaces", additions: 45, deletions: 20, files: 3, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 4. Theo Browne ────────────────────────────────────────
  {
    githubId: 6751787, login: "t3dotgg", name: "Theo Browne",
    email: "theo@t3.gg",
    avatar: "https://avatars.githubusercontent.com/u/6751787?v=4",
    repos: [
      {
        githubId: 915174137, name: "stripe-recommendations", fullName: "t3dotgg/stripe-recommendations",
        url: "https://github.com/t3dotgg/stripe-recommendations",
        desc: "How to implement Stripe without going mad", lang: "TypeScript", stars: 6225,
        issues: [
          { id: 10090, n: 145, title: "Stripe Checkout vs Payment Element — when to use which", body: "Need a decision matrix for Checkout vs Payment Element.", complexity: 3, priority: 4, labels: ["documentation"], comments: 29, state: "open" },
          { id: 10091, n: 138, title: "Webhook idempotency example is missing", body: "Webhook handler doesn't show how to handle duplicate events.", complexity: 5, priority: 5, labels: ["bug", "webhooks", "critical"], comments: 41, state: "open" },
          { id: 10092, n: 131, title: "Add example for subscription with usage-based billing", body: "Metered billing is a common pattern but not covered.", complexity: 7, priority: 3, labels: ["enhancement"], comments: 18, state: "open" },
          { id: 10094, n: 118, title: "Customer portal redirect broken in Next.js App Router", body: "Customer portal redirect uses router.push() but Stripe requires full page redirect.", complexity: 4, priority: 5, labels: ["bug", "nextjs", "app-router"], comments: 35, state: "open" },
        ],
        prs: [
          { id: 20090, n: 147, title: "fix: webhook idempotency with database deduplication", additions: 180, deletions: 20, files: 5, reviews: 4, state: "open" },
          { id: 20091, n: 141, title: "fix: customer portal redirect for App Router", additions: 35, deletions: 25, files: 2, reviews: 2, state: "open" },
          { id: 20092, n: 135, title: "feat: usage-based billing with Stripe Meters API", additions: 320, deletions: 0, files: 8, reviews: 5, state: "open" },
        ],
      },
      {
        githubId: 868338493, name: "quickpic", fullName: "t3dotgg/quickpic",
        url: "https://github.com/t3dotgg/quickpic",
        desc: "Turn SVGs into high resolution PNGs in 2 clicks", lang: "TypeScript", stars: 1264,
        issues: [
          { id: 10100, n: 89, title: "SVG with external font references fails to render", body: "SVGs using Google Fonts don't render correctly.", complexity: 6, priority: 4, labels: ["bug", "fonts"], comments: 15, state: "open" },
          { id: 10101, n: 84, title: "Add batch SVG to PNG conversion", body: "Allow multiple SVGs and download a ZIP.", complexity: 5, priority: 3, labels: ["enhancement"], comments: 12, state: "open" },
          { id: 10103, n: 74, title: "Output quality degraded for SVGs with complex gradients", body: "SVGs with radial gradients lose quality at 2x scale.", complexity: 7, priority: 3, labels: ["bug", "quality"], comments: 19, state: "open" },
        ],
        prs: [
          { id: 20100, n: 91, title: "fix: inline external font references in SVG renderer", additions: 145, deletions: 30, files: 4, reviews: 2, state: "open" },
          { id: 20101, n: 86, title: "feat: batch SVG to PNG with ZIP download", additions: 280, deletions: 15, files: 7, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 613705461, name: "chirp", fullName: "t3dotgg/chirp",
        url: "https://github.com/t3dotgg/chirp",
        desc: "Twitter clone built with T3 stack", lang: "TypeScript", stars: 396,
        issues: [
          { id: 10110, n: 56, title: "Infinite scroll breaks when navigating back", body: "Scroll position resets to top on back navigation.", complexity: 5, priority: 4, labels: ["bug", "ux"], comments: 11, state: "open" },
          { id: 10112, n: 48, title: "Rate limiting on chirp creation endpoint", body: "Without rate limiting, users can spam thousands of chirps.", complexity: 4, priority: 5, labels: ["security", "rate-limiting"], comments: 14, state: "open" },
        ],
        prs: [
          { id: 20110, n: 58, title: "fix: preserve infinite scroll position on back navigation", additions: 95, deletions: 40, files: 4, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 5. shadcn ─────────────────────────────────────────────
  {
    githubId: 124599, login: "shadcn", name: "shadcn",
    email: "shadcn@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
    repos: [
      {
        githubId: 624275469, name: "tiktokenizer", fullName: "shadcn/tiktokenizer",
        url: "https://github.com/shadcn/tiktokenizer",
        desc: "Online playground for OpenAI tokenizers", lang: "TypeScript", stars: 8,
        issues: [
          { id: 10120, n: 34, title: "Add support for Claude tokenizer (Anthropic)", body: "Currently only supports OpenAI tokenizers.", complexity: 6, priority: 4, labels: ["enhancement", "anthropic"], comments: 18, state: "open" },
          { id: 10121, n: 31, title: "Token count differs from OpenAI Playground", body: "For certain Unicode characters, the token count differs.", complexity: 5, priority: 5, labels: ["bug", "accuracy"], comments: 24, state: "open" },
          { id: 10122, n: 28, title: "Add cost estimation per model", body: "Show estimated API cost based on token count.", complexity: 3, priority: 3, labels: ["enhancement"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 20120, n: 36, title: "feat: Claude tokenizer support via tiktoken-node", additions: 280, deletions: 45, files: 8, reviews: 3, state: "open" },
          { id: 20121, n: 33, title: "fix: Unicode emoji token count accuracy", additions: 65, deletions: 20, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 17321805, name: "license-generator", fullName: "shadcn/license-generator",
        url: "https://github.com/shadcn/license-generator",
        desc: "Generates a license for your open source project", lang: "JavaScript", stars: 170,
        issues: [
          { id: 10130, n: 78, title: "Add EUPL (European Union Public License)", body: "EUPL is required for EU government projects.", complexity: 2, priority: 3, labels: ["enhancement"], comments: 5, state: "open" },
          { id: 10133, n: 66, title: "CLI tool for generating licenses from terminal", body: "Add a CLI tool for terminal license generation.", complexity: 5, priority: 3, labels: ["enhancement", "cli"], comments: 14, state: "open" },
        ],
        prs: [
          { id: 20130, n: 80, title: "feat: add EUPL 1.2 license template", additions: 45, deletions: 0, files: 2, reviews: 1, state: "open" },
          { id: 20132, n: 72, title: "feat: CLI tool for terminal license generation", additions: 180, deletions: 0, files: 5, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 887393648, name: "shadcn-electron-app", fullName: "shadcn/shadcn-electron-app",
        url: "https://github.com/shadcn/shadcn-electron-app",
        desc: "electron-vite + shadcn/ui desktop app starter", lang: "TypeScript", stars: 152,
        issues: [
          { id: 10140, n: 45, title: "Auto-updater integration with electron-updater", body: "Add electron-updater for automatic app updates.", complexity: 6, priority: 4, labels: ["enhancement", "auto-update"], comments: 16, state: "open" },
          { id: 10141, n: 41, title: "Dark mode sync with system preference", body: "App doesn't respond to system dark mode changes.", complexity: 3, priority: 4, labels: ["bug", "dark-mode"], comments: 9, state: "open" },
          { id: 10144, n: 32, title: "IPC type safety between main and renderer", body: "Current IPC setup uses untyped channels.", complexity: 7, priority: 4, labels: ["enhancement", "typescript"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 20140, n: 47, title: "feat: auto-updater with electron-updater and GitHub releases", additions: 280, deletions: 15, files: 8, reviews: 3, state: "open" },
          { id: 20141, n: 43, title: "fix: dark mode sync with nativeTheme", additions: 35, deletions: 20, files: 3, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 6. Sindre Sorhus ──────────────────────────────────────
  {
    githubId: 170270, login: "sindresorhus", name: "Sindre Sorhus",
    email: "sindresorhus@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/170270?v=4",
    repos: [
      {
        githubId: 21737465, name: "awesome", fullName: "sindresorhus/awesome",
        url: "https://github.com/sindresorhus/awesome",
        desc: "Awesome lists about all kinds of interesting topics", lang: "Markdown", stars: 449827,
        issues: [
          { id: 30001, n: 2845, title: "Add awesome-ai-agents list", body: "AI agents are a growing category that deserves its own curated list.", complexity: 2, priority: 3, labels: ["enhancement"], comments: 45, state: "open" },
          { id: 30002, n: 2831, title: "Broken links in awesome-nodejs section", body: "Multiple links in the Node.js section return 404.", complexity: 1, priority: 4, labels: ["bug"], comments: 8, state: "open" },
          { id: 30003, n: 2818, title: "Add quality guidelines for new submissions", body: "Need clearer criteria for what makes a list awesome.", complexity: 3, priority: 3, labels: ["documentation"], comments: 67, state: "open" },
          { id: 30004, n: 2805, title: "Automated link checking CI workflow", body: "Add GitHub Actions workflow to check all links periodically.", complexity: 5, priority: 4, labels: ["enhancement", "ci"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40001, n: 2848, title: "feat: add awesome-ai-agents to list", additions: 12, deletions: 0, files: 1, reviews: 3, state: "open" },
          { id: 40002, n: 2835, title: "fix: remove broken links in nodejs section", additions: 0, deletions: 8, files: 1, reviews: 1, state: "open" },
          { id: 40003, n: 2822, title: "ci: add automated link checker with GitHub Actions", additions: 85, deletions: 0, files: 2, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 21737266, name: "awesome-nodejs", fullName: "sindresorhus/awesome-nodejs",
        url: "https://github.com/sindresorhus/awesome-nodejs",
        desc: "Delightful Node.js packages and resources", lang: "Markdown", stars: 65450,
        issues: [
          { id: 30010, n: 1456, title: "Add Bun-compatible packages section", body: "With Bun's rise, need a section for Bun-compatible Node packages.", complexity: 4, priority: 3, labels: ["enhancement", "bun"], comments: 31, state: "open" },
          { id: 30011, n: 1442, title: "Reorganize by use case instead of package type", body: "Current organization by package type is hard to navigate.", complexity: 6, priority: 2, labels: ["enhancement", "ux"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40010, n: 1458, title: "feat: add Bun compatibility section", additions: 45, deletions: 0, files: 1, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 34453060, name: "awesome-electron", fullName: "sindresorhus/awesome-electron",
        url: "https://github.com/sindresorhus/awesome-electron",
        desc: "Useful resources for creating apps with Electron", lang: "Markdown", stars: 27044,
        issues: [
          { id: 30020, n: 892, title: "Add Tauri migration guide section", body: "Many Electron apps are migrating to Tauri. Need a comparison section.", complexity: 4, priority: 3, labels: ["enhancement", "tauri"], comments: 25, state: "open" },
          { id: 30021, n: 885, title: "Security best practices section outdated", body: "Security section still references Electron 20 APIs.", complexity: 3, priority: 5, labels: ["bug", "security"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40020, n: 894, title: "feat: add Tauri comparison and migration guide", additions: 120, deletions: 0, files: 1, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 7. TJ Holowaychuk ─────────────────────────────────────
  {
    githubId: 25254, login: "tj", name: "TJ Holowaychuk",
    email: "tj@vision-media.ca",
    avatar: "https://avatars.githubusercontent.com/u/25254?v=4",
    repos: [
      {
        githubId: 2206953, name: "commander.js", fullName: "tj/commander.js",
        url: "https://github.com/tj/commander.js",
        desc: "node.js command-line interfaces made easy", lang: "JavaScript", stars: 28035,
        issues: [
          { id: 30030, n: 2145, title: "ESM-only mode breaks CommonJS consumers", body: "Switching to ESM-only breaks many existing CLI tools.", complexity: 7, priority: 5, labels: ["bug", "esm", "breaking"], comments: 89, state: "open" },
          { id: 30031, n: 2138, title: "Add shell completion generation", body: "Auto-generate bash/zsh/fish completions from command definitions.", complexity: 8, priority: 3, labels: ["enhancement"], comments: 34, state: "open" },
          { id: 30032, n: 2131, title: "TypeScript generics for option parsing", body: "Option types should be inferred from the option definition.", complexity: 6, priority: 4, labels: ["enhancement", "typescript"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40030, n: 2148, title: "feat: dual ESM/CJS package with conditional exports", additions: 180, deletions: 45, files: 6, reviews: 5, state: "open" },
          { id: 40031, n: 2141, title: "feat: shell completion generation for bash/zsh/fish", additions: 520, deletions: 0, files: 8, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 1223029, name: "n", fullName: "tj/n",
        url: "https://github.com/tj/n",
        desc: "Node version management", lang: "Shell", stars: 19533,
        issues: [
          { id: 30040, n: 845, title: "ARM64 binary detection fails on Apple Silicon", body: "n downloads x64 binaries on M1/M2 Macs.", complexity: 4, priority: 5, labels: ["bug", "arm64", "macos"], comments: 42, state: "open" },
          { id: 30041, n: 838, title: "Add support for Corepack integration", body: "Corepack is now bundled with Node.js. n should manage it.", complexity: 5, priority: 3, labels: ["enhancement"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40040, n: 848, title: "fix: ARM64 binary detection for Apple Silicon", additions: 35, deletions: 12, files: 2, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 817345, name: "git-extras", fullName: "tj/git-extras",
        url: "https://github.com/tj/git-extras",
        desc: "GIT utilities — repo summary, repl, changelog population", lang: "Shell", stars: 18012,
        issues: [
          { id: 30050, n: 1023, title: "git-effort fails on repos with spaces in path", body: "git-effort crashes when the repo path contains spaces.", complexity: 2, priority: 4, labels: ["bug"], comments: 6, state: "open" },
          { id: 30051, n: 1018, title: "Add git-ai-commit command", body: "Generate commit messages using AI from staged changes.", complexity: 7, priority: 2, labels: ["enhancement", "ai"], comments: 45, state: "open" },
        ],
        prs: [
          { id: 40050, n: 1025, title: "fix: handle spaces in repo path for git-effort", additions: 15, deletions: 8, files: 1, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 8. Guillermo Rauch ────────────────────────────────────
  {
    githubId: 13041, login: "rauchg", name: "Guillermo Rauch",
    email: "rauchg@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/13041?v=4",
    repos: [
      {
        githubId: 29882262, name: "slackin", fullName: "rauchg/slackin",
        url: "https://github.com/rauchg/slackin",
        desc: "Public Slack organizations made easy", lang: "JavaScript", stars: 6501,
        issues: [
          { id: 30060, n: 312, title: "Slack API v2 migration required", body: "Slack deprecated the legacy token API. Need to migrate to v2 OAuth.", complexity: 8, priority: 5, labels: ["bug", "breaking", "api"], comments: 67, state: "open" },
          { id: 30061, n: 305, title: "Add Discord alternative support", body: "Many communities are moving to Discord. Add Discord invite support.", complexity: 6, priority: 3, labels: ["enhancement"], comments: 23, state: "open" },
        ],
        prs: [
          { id: 40060, n: 315, title: "feat: migrate to Slack API v2 OAuth flow", additions: 340, deletions: 280, files: 8, reviews: 5, state: "open" },
        ],
      },
      {
        githubId: 30812374, name: "wifi-password", fullName: "rauchg/wifi-password",
        url: "https://github.com/rauchg/wifi-password",
        desc: "Get the password of the wifi you're on (bash)", lang: "Shell", stars: 4542,
        issues: [
          { id: 30070, n: 89, title: "macOS Sonoma breaks keychain access", body: "Security framework changes in Sonoma prevent keychain access.", complexity: 5, priority: 5, labels: ["bug", "macos"], comments: 34, state: "open" },
          { id: 30071, n: 84, title: "Add Linux NetworkManager support", body: "Currently only works on macOS. Add Linux support.", complexity: 4, priority: 3, labels: ["enhancement", "linux"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40070, n: 91, title: "fix: macOS Sonoma keychain access with security framework", additions: 25, deletions: 12, files: 1, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 77870371, name: "blog", fullName: "rauchg/blog",
        url: "https://github.com/rauchg/blog",
        desc: "Personal blog by Guillermo Rauch", lang: "MDX", stars: 1398,
        issues: [
          { id: 30080, n: 45, title: "RSS feed generation broken after MDX upgrade", body: "RSS feed returns empty content after upgrading to MDX 3.", complexity: 4, priority: 4, labels: ["bug", "rss"], comments: 8, state: "open" },
        ],
        prs: [
          { id: 40080, n: 47, title: "fix: RSS feed content generation with MDX 3", additions: 45, deletions: 20, files: 2, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 9. Dan Abramov ────────────────────────────────────────
  {
    githubId: 810438, login: "gaearon", name: "Dan Abramov",
    email: "dan.abramov@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/810438?v=4",
    repos: [
      {
        githubId: 21779020, name: "react-hot-loader", fullName: "gaearon/react-hot-loader",
        url: "https://github.com/gaearon/react-hot-loader",
        desc: "Tweak React components in real time (Deprecated: use Fast Refresh)", lang: "JavaScript", stars: 12202,
        issues: [
          { id: 30090, n: 1678, title: "Deprecation notice not visible enough", body: "Users still install this instead of using Fast Refresh.", complexity: 1, priority: 3, labels: ["documentation"], comments: 12, state: "open" },
          { id: 30091, n: 1672, title: "React 19 compatibility completely broken", body: "React 19 internal changes break all hot-loading functionality.", complexity: 9, priority: 2, labels: ["bug", "react-19"], comments: 45, state: "open" },
        ],
        prs: [
          { id: 40090, n: 1680, title: "docs: add prominent deprecation banner to README", additions: 15, deletions: 2, files: 1, reviews: 1, state: "open" },
        ],
      },
      {
        githubId: 159876616, name: "overreacted.io", fullName: "gaearon/overreacted.io",
        url: "https://github.com/gaearon/overreacted.io",
        desc: "Personal blog by Dan Abramov", lang: "TypeScript", stars: 7266,
        issues: [
          { id: 30100, n: 456, title: "Dark mode toggle doesn't persist across pages", body: "Theme resets to light mode on navigation.", complexity: 3, priority: 4, labels: ["bug", "ux"], comments: 15, state: "open" },
          { id: 30101, n: 449, title: "Code blocks missing syntax highlighting for JSX", body: "JSX code blocks render as plain text.", complexity: 4, priority: 3, labels: ["bug", "syntax"], comments: 9, state: "open" },
          { id: 30102, n: 442, title: "Add search functionality", body: "No way to search through blog posts.", complexity: 6, priority: 3, labels: ["enhancement"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40100, n: 458, title: "fix: persist dark mode preference in localStorage", additions: 25, deletions: 8, files: 2, reviews: 1, state: "open" },
          { id: 40101, n: 451, title: "fix: JSX syntax highlighting in code blocks", additions: 45, deletions: 12, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 23260742, name: "react-hot-boilerplate", fullName: "gaearon/react-hot-boilerplate",
        url: "https://github.com/gaearon/react-hot-boilerplate",
        desc: "Minimal live-editing example for React", lang: "JavaScript", stars: 3898,
        issues: [
          { id: 30110, n: 234, title: "Webpack 5 migration needed", body: "Still uses Webpack 4 which is unmaintained.", complexity: 6, priority: 4, labels: ["migration", "webpack"], comments: 19, state: "open" },
        ],
        prs: [
          { id: 40110, n: 236, title: "chore: migrate to Webpack 5 with updated config", additions: 120, deletions: 85, files: 4, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 10. Rich Harris ───────────────────────────────────────
  {
    githubId: 1162160, login: "Rich-Harris", name: "Rich Harris",
    email: "rich.harris@vercel.com",
    avatar: "https://avatars.githubusercontent.com/u/1162160?v=4",
    repos: [
      {
        githubId: 98913789, name: "degit", fullName: "Rich-Harris/degit",
        url: "https://github.com/Rich-Harris/degit",
        desc: "Straightforward project scaffolding", lang: "JavaScript", stars: 7826,
        issues: [
          { id: 30120, n: 412, title: "GitHub API rate limiting causes silent failures", body: "degit fails silently when GitHub API rate limit is hit.", complexity: 5, priority: 5, labels: ["bug", "api"], comments: 34, state: "open" },
          { id: 30121, n: 405, title: "Add GitLab and Bitbucket support", body: "Currently only works with GitHub repos.", complexity: 7, priority: 3, labels: ["enhancement"], comments: 45, state: "open" },
          { id: 30122, n: 398, title: "Monorepo subdirectory cloning broken", body: "Cannot clone a subdirectory from a monorepo.", complexity: 4, priority: 4, labels: ["bug"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40120, n: 414, title: "fix: handle GitHub API rate limiting with retry logic", additions: 85, deletions: 12, files: 3, reviews: 3, state: "open" },
          { id: 40121, n: 407, title: "feat: add GitLab support", additions: 240, deletions: 20, files: 6, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 24478678, name: "ramjet", fullName: "Rich-Harris/ramjet",
        url: "https://github.com/Rich-Harris/ramjet",
        desc: "Morph DOM elements from one state to another with smooth animations", lang: "JavaScript", stars: 5444,
        issues: [
          { id: 30130, n: 178, title: "CSS transform origin not preserved during morph", body: "Elements with custom transform-origin lose it during animation.", complexity: 5, priority: 3, labels: ["bug", "css"], comments: 11, state: "open" },
          { id: 30131, n: 172, title: "Add View Transitions API integration", body: "Modern browsers support View Transitions. Integrate with it.", complexity: 7, priority: 3, labels: ["enhancement"], comments: 19, state: "open" },
        ],
        prs: [
          { id: 40130, n: 180, title: "fix: preserve transform-origin during morph animation", additions: 35, deletions: 8, files: 2, reviews: 1, state: "open" },
        ],
      },
      {
        githubId: 26143240, name: "magic-string", fullName: "Rich-Harris/magic-string",
        url: "https://github.com/Rich-Harris/magic-string",
        desc: "Manipulate strings like a wizard", lang: "JavaScript", stars: 2678,
        issues: [
          { id: 30140, n: 256, title: "Source map generation incorrect for multi-line replacements", body: "Source maps point to wrong lines after multi-line string replacement.", complexity: 6, priority: 5, labels: ["bug", "sourcemaps"], comments: 28, state: "open" },
          { id: 30141, n: 249, title: "Performance regression with large files (>1MB)", body: "Processing files over 1MB is 10x slower than v0.25.", complexity: 7, priority: 4, labels: ["bug", "performance"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40140, n: 258, title: "fix: source map line mapping for multi-line replacements", additions: 120, deletions: 45, files: 4, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 11. Evan You ──────────────────────────────────────────
  {
    githubId: 499550, login: "yyx990803", name: "Evan You",
    email: "yyx990803@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/499550?v=4",
    repos: [
      {
        githubId: 164251040, name: "build-your-own-mint", fullName: "yyx990803/build-your-own-mint",
        url: "https://github.com/yyx990803/build-your-own-mint",
        desc: "Build your own personal finance analytics using Plaid and Google Sheets", lang: "HTML", stars: 2532,
        issues: [
          { id: 30150, n: 189, title: "Plaid API v2 migration required", body: "Plaid deprecated v1 endpoints. Need to migrate to v2.", complexity: 7, priority: 5, labels: ["bug", "breaking", "api"], comments: 34, state: "open" },
          { id: 30151, n: 182, title: "Add support for European banks via Open Banking", body: "European banks use Open Banking API instead of Plaid.", complexity: 8, priority: 3, labels: ["enhancement"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40150, n: 191, title: "feat: migrate to Plaid API v2", additions: 280, deletions: 180, files: 6, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 154927626, name: "vue-hooks", fullName: "yyx990803/vue-hooks",
        url: "https://github.com/yyx990803/vue-hooks",
        desc: "Experimental React hooks implementation in Vue", lang: "JavaScript", stars: 1592,
        issues: [
          { id: 30160, n: 78, title: "Vue 3 Composition API makes this obsolete", body: "Vue 3's Composition API provides native hooks-like functionality.", complexity: 2, priority: 2, labels: ["documentation"], comments: 45, state: "open" },
        ],
        prs: [
          { id: 40160, n: 80, title: "docs: add deprecation notice for Vue 3 users", additions: 20, deletions: 0, files: 1, reviews: 1, state: "open" },
        ],
      },
      {
        githubId: 8302641, name: "pod", fullName: "yyx990803/pod",
        url: "https://github.com/yyx990803/pod",
        desc: "Git push deploy for Node.js", lang: "JavaScript", stars: 1334,
        issues: [
          { id: 30170, n: 156, title: "Node.js 22 compatibility issues", body: "pod fails to start with Node.js 22 due to deprecated APIs.", complexity: 4, priority: 5, labels: ["bug", "node-22"], comments: 12, state: "open" },
          { id: 30171, n: 149, title: "Add Docker deployment support", body: "Support deploying to Docker containers instead of bare metal.", complexity: 6, priority: 3, labels: ["enhancement", "docker"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40170, n: 158, title: "fix: Node.js 22 compatibility with updated APIs", additions: 45, deletions: 30, files: 3, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 12. Andrew Gallant (BurntSushi) ───────────────────────
  {
    githubId: 456674, login: "BurntSushi", name: "Andrew Gallant",
    email: "jamslam@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/456674?v=4",
    repos: [
      {
        githubId: 53631945, name: "ripgrep", fullName: "BurntSushi/ripgrep",
        url: "https://github.com/BurntSushi/ripgrep",
        desc: "ripgrep recursively searches directories for a regex pattern", lang: "Rust", stars: 61536,
        issues: [
          { id: 30180, n: 2845, title: "PCRE2 JIT compilation fails on ARM64 Linux", body: "JIT compilation segfaults on ARM64 with certain patterns.", complexity: 9, priority: 5, labels: ["bug", "pcre2", "arm64"], comments: 34, state: "open" },
          { id: 30181, n: 2838, title: "Add --json output format for structured results", body: "Machine-readable JSON output for integration with other tools.", complexity: 6, priority: 3, labels: ["enhancement"], comments: 56, state: "open" },
          { id: 30182, n: 2831, title: "Memory usage spikes on binary file detection", body: "Binary file detection reads entire file into memory.", complexity: 7, priority: 4, labels: ["bug", "performance"], comments: 22, state: "open" },
          { id: 30183, n: 2824, title: "Unicode property escapes not supported", body: "Patterns like \\p{Emoji} don't work without PCRE2.", complexity: 5, priority: 3, labels: ["enhancement", "unicode"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40180, n: 2848, title: "fix: PCRE2 JIT ARM64 compilation with guard pages", additions: 120, deletions: 25, files: 4, reviews: 6, state: "open" },
          { id: 40181, n: 2841, title: "feat: structured JSON output format", additions: 380, deletions: 0, files: 8, reviews: 5, state: "open" },
        ],
      },
      {
        githubId: 23560214, name: "xsv", fullName: "BurntSushi/xsv",
        url: "https://github.com/BurntSushi/xsv",
        desc: "A fast CSV command line toolkit written in Rust", lang: "Rust", stars: 10758,
        issues: [
          { id: 30190, n: 345, title: "UTF-8 BOM handling incorrect", body: "CSV files with UTF-8 BOM have first column name corrupted.", complexity: 3, priority: 4, labels: ["bug", "encoding"], comments: 15, state: "open" },
          { id: 30191, n: 338, title: "Add Parquet output format", body: "Support converting CSV to Parquet for data engineering workflows.", complexity: 8, priority: 3, labels: ["enhancement"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40190, n: 347, title: "fix: strip UTF-8 BOM from first column header", additions: 25, deletions: 5, files: 2, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 8425622, name: "toml", fullName: "BurntSushi/toml",
        url: "https://github.com/BurntSushi/toml",
        desc: "TOML parser for Golang with reflection", lang: "Go", stars: 4923,
        issues: [
          { id: 30200, n: 412, title: "TOML v1.1 datetime-local support missing", body: "TOML v1.1 added datetime-local type which isn't supported.", complexity: 5, priority: 4, labels: ["enhancement", "toml-v1.1"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40200, n: 414, title: "feat: TOML v1.1 datetime-local type support", additions: 180, deletions: 20, files: 5, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 13. David Peter (sharkdp) ─────────────────────────────
  {
    githubId: 4209276, login: "sharkdp", name: "David Peter",
    email: "sharkdp@users.noreply.github.com",
    avatar: "https://avatars.githubusercontent.com/u/4209276?v=4",
    repos: [
      {
        githubId: 130464961, name: "bat", fullName: "sharkdp/bat",
        url: "https://github.com/sharkdp/bat",
        desc: "A cat(1) clone with wings", lang: "Rust", stars: 57842,
        issues: [
          { id: 30210, n: 3012, title: "Syntax highlighting broken for Zig files", body: "Zig syntax highlighting produces incorrect colors for comptime blocks.", complexity: 4, priority: 3, labels: ["bug", "syntax"], comments: 15, state: "open" },
          { id: 30211, n: 3005, title: "Git diff integration shows wrong line numbers", body: "When using bat with git diff, line numbers are offset by 1.", complexity: 5, priority: 4, labels: ["bug", "git"], comments: 22, state: "open" },
          { id: 30212, n: 2998, title: "Add tree-sitter based highlighting", body: "Replace current regex-based highlighting with tree-sitter.", complexity: 9, priority: 3, labels: ["enhancement", "tree-sitter"], comments: 78, state: "open" },
        ],
        prs: [
          { id: 40210, n: 3015, title: "fix: Zig comptime block syntax highlighting", additions: 45, deletions: 12, files: 2, reviews: 2, state: "open" },
          { id: 40211, n: 3008, title: "fix: git diff line number offset calculation", additions: 35, deletions: 15, files: 3, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 90793418, name: "fd", fullName: "sharkdp/fd",
        url: "https://github.com/sharkdp/fd",
        desc: "A simple, fast and user-friendly alternative to find", lang: "Rust", stars: 42226,
        issues: [
          { id: 30220, n: 1567, title: "Symlink loop detection causes infinite hang", body: "fd hangs indefinitely when encountering circular symlinks.", complexity: 6, priority: 5, labels: ["bug", "symlinks"], comments: 28, state: "open" },
          { id: 30221, n: 1560, title: "Add --exec-batch for parallel execution", body: "Execute command on batches of results for better performance.", complexity: 5, priority: 3, labels: ["enhancement"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40220, n: 1569, title: "fix: detect and break symlink loops with visited set", additions: 65, deletions: 8, files: 3, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 117356231, name: "hyperfine", fullName: "sharkdp/hyperfine",
        url: "https://github.com/sharkdp/hyperfine",
        desc: "A command-line benchmarking tool", lang: "Rust", stars: 27778,
        issues: [
          { id: 30230, n: 789, title: "Statistical outlier detection too aggressive", body: "Removes too many runs as outliers with small sample sizes.", complexity: 6, priority: 3, labels: ["bug", "statistics"], comments: 22, state: "open" },
          { id: 30231, n: 782, title: "Add JSON export for CI integration", body: "Export benchmark results as JSON for CI/CD pipelines.", complexity: 4, priority: 4, labels: ["enhancement", "ci"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40230, n: 791, title: "fix: adjust outlier detection threshold for small samples", additions: 45, deletions: 20, files: 2, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 14. Mitchell Hashimoto ────────────────────────────────
  {
    githubId: 1299, login: "mitchellh", name: "Mitchell Hashimoto",
    email: "mitchell.hashimoto@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/1299?v=4",
    repos: [
      {
        githubId: 10166531, name: "mapstructure", fullName: "mitchellh/mapstructure",
        url: "https://github.com/mitchellh/mapstructure",
        desc: "Go library for decoding generic map values into native Go structures", lang: "Go", stars: 8046,
        issues: [
          { id: 30240, n: 378, title: "Generics support for Go 1.22+", body: "Add generic type parameter support for type-safe decoding.", complexity: 7, priority: 4, labels: ["enhancement", "generics"], comments: 34, state: "open" },
          { id: 30241, n: 371, title: "Nested struct decoding panics on nil pointer", body: "Decoding a nil nested struct causes a nil pointer dereference.", complexity: 4, priority: 5, labels: ["bug", "panic"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40240, n: 380, title: "feat: Go generics support for type-safe decoding", additions: 280, deletions: 45, files: 6, reviews: 5, state: "open" },
          { id: 40241, n: 373, title: "fix: nil pointer check for nested struct decoding", additions: 25, deletions: 5, files: 2, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 14460330, name: "gox", fullName: "mitchellh/gox",
        url: "https://github.com/mitchellh/gox",
        desc: "A dead simple, no frills Go cross compile tool", lang: "Go", stars: 4587,
        issues: [
          { id: 30250, n: 234, title: "Go 1.22 module-aware mode breaks compilation", body: "gox fails with Go 1.22 when using module-aware mode.", complexity: 5, priority: 5, labels: ["bug", "go-1.22"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40250, n: 236, title: "fix: Go 1.22 module-aware compilation support", additions: 65, deletions: 30, files: 3, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 1150912706, name: "vouch", fullName: "mitchellh/vouch",
        url: "https://github.com/mitchellh/vouch",
        desc: "A community trust management system based on explicit vouches", lang: "Nushell", stars: 4030,
        issues: [
          { id: 30260, n: 89, title: "Trust chain verification timeout on large graphs", body: "Verification takes >30s for communities with 1000+ members.", complexity: 8, priority: 4, labels: ["performance"], comments: 15, state: "open" },
          { id: 30261, n: 82, title: "Add revocation mechanism for vouches", body: "No way to revoke a vouch once given.", complexity: 6, priority: 5, labels: ["enhancement", "security"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40260, n: 91, title: "perf: optimize trust chain verification with caching", additions: 180, deletions: 45, files: 5, reviews: 4, state: "open" },
        ],
      },
    ],
  },
  // ─── 15. Fatih Arslan ──────────────────────────────────────
  {
    githubId: 438920, login: "fatih", name: "Fatih Arslan",
    email: "fatih@arslan.io",
    avatar: "https://avatars.githubusercontent.com/u/438920?v=4",
    repos: [
      {
        githubId: 18062944, name: "vim-go", fullName: "fatih/vim-go",
        url: "https://github.com/fatih/vim-go",
        desc: "Go development plugin for Vim", lang: "Vim Script", stars: 16235,
        issues: [
          { id: 30270, n: 3456, title: "gopls integration breaks with Go 1.23", body: "gopls commands fail silently with Go 1.23 toolchain.", complexity: 7, priority: 5, labels: ["bug", "gopls"], comments: 45, state: "open" },
          { id: 30271, n: 3449, title: "Add Neovim native LSP fallback", body: "When Neovim's native LSP is available, use it instead of vim-go's.", complexity: 8, priority: 3, labels: ["enhancement", "neovim"], comments: 34, state: "open" },
          { id: 30272, n: 3442, title: "Code lens support for test functions", body: "Add clickable code lens above test functions to run them.", complexity: 5, priority: 3, labels: ["enhancement"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40270, n: 3458, title: "fix: gopls integration for Go 1.23 toolchain", additions: 120, deletions: 45, files: 5, reviews: 4, state: "open" },
          { id: 40271, n: 3451, title: "feat: Neovim native LSP detection and fallback", additions: 280, deletions: 20, files: 8, reviews: 5, state: "open" },
        ],
      },
      {
        githubId: 16907502, name: "color", fullName: "fatih/color",
        url: "https://github.com/fatih/color",
        desc: "Color package for Go (golang)", lang: "Go", stars: 7923,
        issues: [
          { id: 30280, n: 234, title: "Windows Terminal true color detection", body: "color doesn't detect Windows Terminal's true color support.", complexity: 4, priority: 4, labels: ["bug", "windows"], comments: 12, state: "open" },
          { id: 30281, n: 228, title: "Add 256-color and RGB support", body: "Only supports 16 ANSI colors. Need 256 and RGB.", complexity: 6, priority: 3, labels: ["enhancement"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40280, n: 236, title: "fix: Windows Terminal true color detection", additions: 45, deletions: 12, files: 2, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 22284914, name: "structs", fullName: "fatih/structs",
        url: "https://github.com/fatih/structs",
        desc: "Utilities for Go structs", lang: "Go", stars: 3932,
        issues: [
          { id: 30290, n: 145, title: "Generics support for struct operations", body: "Add generic versions of Map, Values, Names functions.", complexity: 5, priority: 3, labels: ["enhancement", "generics"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40290, n: 147, title: "feat: generic struct operations for Go 1.22+", additions: 180, deletions: 0, files: 4, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 16. Jason Miller (developit) ──────────────────────────
  {
    githubId: 105127, login: "developit", name: "Jason Miller",
    email: "developit@users.noreply.github.com",
    avatar: "https://avatars.githubusercontent.com/u/105127?v=4",
    repos: [
      {
        githubId: 78983309, name: "mitt", fullName: "developit/mitt",
        url: "https://github.com/developit/mitt",
        desc: "Tiny 200 byte functional event emitter / pubsub", lang: "TypeScript", stars: 11853,
        issues: [
          { id: 30300, n: 189, title: "TypeScript event type inference broken with generics", body: "Event handler types not inferred correctly with generic event maps.", complexity: 5, priority: 4, labels: ["bug", "typescript"], comments: 22, state: "open" },
          { id: 30301, n: 182, title: "Add once() method for single-fire handlers", body: "Common pattern to listen for an event only once.", complexity: 2, priority: 3, labels: ["enhancement"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40300, n: 191, title: "fix: TypeScript generic event type inference", additions: 35, deletions: 12, files: 2, reviews: 2, state: "open" },
          { id: 40301, n: 184, title: "feat: add once() method", additions: 25, deletions: 0, files: 2, reviews: 1, state: "open" },
        ],
      },
      {
        githubId: 142916901, name: "htm", fullName: "developit/htm",
        url: "https://github.com/developit/htm",
        desc: "Hyperscript Tagged Markup: JSX alternative using standard tagged templates", lang: "JavaScript", stars: 9015,
        issues: [
          { id: 30310, n: 256, title: "Template literal parsing fails with nested expressions", body: "Nested template literals inside htm cause parsing errors.", complexity: 6, priority: 4, labels: ["bug", "parser"], comments: 18, state: "open" },
          { id: 30311, n: 249, title: "Add React Server Components support", body: "htm should work with React Server Components.", complexity: 7, priority: 3, labels: ["enhancement", "rsc"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40310, n: 258, title: "fix: nested template literal parsing", additions: 65, deletions: 20, files: 3, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 113912360, name: "microbundle", fullName: "developit/microbundle",
        url: "https://github.com/developit/microbundle",
        desc: "Zero-configuration bundler for tiny modules", lang: "JavaScript", stars: 8142,
        issues: [
          { id: 30320, n: 1023, title: "ESM output missing file extensions", body: "ESM output doesn't include .js extensions in import paths.", complexity: 4, priority: 5, labels: ["bug", "esm"], comments: 34, state: "open" },
          { id: 30321, n: 1016, title: "Add CSS Modules support", body: "No built-in support for CSS Modules.", complexity: 6, priority: 3, labels: ["enhancement", "css"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40320, n: 1025, title: "fix: add .js extensions to ESM import paths", additions: 85, deletions: 15, files: 4, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 17. Addy Osmani ───────────────────────────────────────
  {
    githubId: 110953, login: "addyosmani", name: "Addy Osmani",
    email: "addyosmani@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/110953?v=4",
    repos: [
      {
        githubId: 21299916, name: "critical", fullName: "addyosmani/critical",
        url: "https://github.com/addyosmani/critical",
        desc: "Extract and Inline Critical-path CSS in HTML pages", lang: "JavaScript", stars: 10178,
        issues: [
          { id: 30330, n: 567, title: "Puppeteer 22 breaks CSS extraction", body: "Puppeteer 22 changed the page.evaluate API.", complexity: 6, priority: 5, labels: ["bug", "puppeteer"], comments: 28, state: "open" },
          { id: 30331, n: 560, title: "Add support for CSS Container Queries", body: "Container queries are not included in critical CSS extraction.", complexity: 5, priority: 3, labels: ["enhancement", "css"], comments: 15, state: "open" },
          { id: 30332, n: 553, title: "Memory leak when processing multiple pages", body: "Memory grows unbounded when processing 100+ pages.", complexity: 7, priority: 4, labels: ["bug", "memory-leak"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40330, n: 569, title: "fix: Puppeteer 22 API compatibility", additions: 120, deletions: 65, files: 4, reviews: 3, state: "open" },
          { id: 40331, n: 562, title: "feat: CSS Container Queries support", additions: 180, deletions: 20, files: 5, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 3022431, name: "backbone-fundamentals", fullName: "addyosmani/backbone-fundamentals",
        url: "https://github.com/addyosmani/backbone-fundamentals",
        desc: "A creative-commons book on Backbone.js", lang: "Rich Text Format", stars: 9198,
        issues: [
          { id: 30340, n: 345, title: "Add modern alternatives comparison chapter", body: "Book should mention React, Vue, Svelte as modern alternatives.", complexity: 4, priority: 2, labels: ["enhancement", "content"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40340, n: 347, title: "docs: add modern framework alternatives chapter", additions: 280, deletions: 0, files: 2, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 1530104, name: "essential-js-design-patterns", fullName: "addyosmani/essential-js-design-patterns",
        url: "https://github.com/addyosmani/essential-js-design-patterns",
        desc: "Repo for Learning JavaScript Design Patterns book", lang: "HTML", stars: 4907,
        issues: [
          { id: 30350, n: 234, title: "Update patterns for ES2024+ syntax", body: "Many patterns still use ES5 syntax.", complexity: 6, priority: 3, labels: ["enhancement", "modernization"], comments: 28, state: "open" },
          { id: 30351, n: 228, title: "Add TypeScript examples for all patterns", body: "TypeScript versions of all design pattern examples.", complexity: 7, priority: 3, labels: ["enhancement", "typescript"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40350, n: 236, title: "feat: modernize patterns to ES2024+ syntax", additions: 450, deletions: 380, files: 15, reviews: 4, state: "open" },
        ],
      },
    ],
  },
  // ─── 18. Colin McDonnell (Zod) ─────────────────────────────
  {
    githubId: 3084745, login: "colinhacks", name: "Colin McDonnell",
    email: "colinhacks@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/3084745?v=4",
    repos: [
      {
        githubId: 245704608, name: "zod", fullName: "colinhacks/zod",
        url: "https://github.com/colinhacks/zod",
        desc: "TypeScript-first schema validation with static type inference", lang: "TypeScript", stars: 42239,
        issues: [
          { id: 30360, n: 3456, title: "Zod 4 migration guide incomplete", body: "Many breaking changes in Zod 4 are not documented.", complexity: 5, priority: 5, labels: ["documentation", "v4"], comments: 89, state: "open" },
          { id: 30361, n: 3449, title: "Performance regression with deeply nested schemas", body: "Validation is 5x slower for schemas with 10+ levels of nesting.", complexity: 8, priority: 4, labels: ["bug", "performance"], comments: 45, state: "open" },
          { id: 30362, n: 3442, title: "Add JSON Schema to Zod converter", body: "Convert existing JSON Schema definitions to Zod schemas.", complexity: 7, priority: 3, labels: ["enhancement"], comments: 56, state: "open" },
          { id: 30363, n: 3435, title: "Discriminated union error messages confusing", body: "Error messages for discriminated unions don't indicate which variant failed.", complexity: 4, priority: 4, labels: ["bug", "dx"], comments: 34, state: "open" },
        ],
        prs: [
          { id: 40360, n: 3458, title: "docs: comprehensive Zod 4 migration guide", additions: 520, deletions: 0, files: 3, reviews: 5, state: "open" },
          { id: 40361, n: 3451, title: "perf: optimize deeply nested schema validation", additions: 180, deletions: 65, files: 6, reviews: 6, state: "open" },
          { id: 40362, n: 3444, title: "feat: JSON Schema to Zod converter", additions: 680, deletions: 0, files: 10, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 1008874029, name: "zshy", fullName: "colinhacks/zshy",
        url: "https://github.com/colinhacks/zshy",
        desc: "Bundler-free build tool for TypeScript libraries powered by tsc", lang: "TypeScript", stars: 1094,
        issues: [
          { id: 30370, n: 89, title: "Watch mode doesn't detect new files", body: "Adding new .ts files requires restarting the watcher.", complexity: 4, priority: 4, labels: ["bug", "watch"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40370, n: 91, title: "fix: watch mode file system event handling for new files", additions: 65, deletions: 20, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 266632203, name: "devii", fullName: "colinhacks/devii",
        url: "https://github.com/colinhacks/devii",
        desc: "A developer blog starter for 2021", lang: "TypeScript", stars: 498,
        issues: [
          { id: 30380, n: 56, title: "Next.js 15 compatibility issues", body: "App Router changes break the blog template.", complexity: 6, priority: 4, labels: ["bug", "nextjs"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40380, n: 58, title: "fix: Next.js 15 App Router compatibility", additions: 180, deletions: 120, files: 8, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 19. David Tolnay ──────────────────────────────────────
  {
    githubId: 1940490, login: "dtolnay", name: "David Tolnay",
    email: "dtolnay@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/1940490?v=4",
    repos: [
      {
        githubId: 230383021, name: "cxx", fullName: "dtolnay/cxx",
        url: "https://github.com/dtolnay/cxx",
        desc: "Safe interop between Rust and C++", lang: "Rust", stars: 6695,
        issues: [
          { id: 30390, n: 1345, title: "C++23 std::expected support", body: "Add bindings for C++23 std::expected type.", complexity: 7, priority: 3, labels: ["enhancement", "c++23"], comments: 22, state: "open" },
          { id: 30391, n: 1338, title: "Compile error with MSVC 2022 17.9", body: "MSVC generates incorrect code for shared_ptr bridging.", complexity: 8, priority: 5, labels: ["bug", "msvc"], comments: 18, state: "open" },
          { id: 30392, n: 1331, title: "Add async function bridging", body: "Bridge Rust async functions to C++ coroutines.", complexity: 9, priority: 3, labels: ["enhancement", "async"], comments: 45, state: "open" },
        ],
        prs: [
          { id: 40390, n: 1347, title: "fix: MSVC 2022 17.9 shared_ptr code generation", additions: 85, deletions: 25, files: 4, reviews: 5, state: "open" },
          { id: 40391, n: 1340, title: "feat: C++23 std::expected type bindings", additions: 320, deletions: 0, files: 8, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 212936374, name: "anyhow", fullName: "dtolnay/anyhow",
        url: "https://github.com/dtolnay/anyhow",
        desc: "Flexible concrete Error type built on std::error::Error", lang: "Rust", stars: 6472,
        issues: [
          { id: 30400, n: 456, title: "Backtrace capture performance overhead", body: "Capturing backtraces adds 2ms per error creation.", complexity: 6, priority: 3, labels: ["performance"], comments: 22, state: "open" },
          { id: 30401, n: 449, title: "Add structured error context", body: "Support attaching key-value context to errors.", complexity: 5, priority: 4, labels: ["enhancement"], comments: 34, state: "open" },
        ],
        prs: [
          { id: 40400, n: 458, title: "perf: lazy backtrace capture with deferred symbolization", additions: 120, deletions: 45, files: 4, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 213836768, name: "thiserror", fullName: "dtolnay/thiserror",
        url: "https://github.com/dtolnay/thiserror",
        desc: "derive(Error) for struct and enum error types", lang: "Rust", stars: 5386,
        issues: [
          { id: 30410, n: 345, title: "Proc macro expansion fails with nightly-2024-03", body: "Latest nightly breaks proc macro expansion for nested enums.", complexity: 7, priority: 5, labels: ["bug", "nightly"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40410, n: 347, title: "fix: proc macro expansion for nightly-2024-03", additions: 45, deletions: 20, files: 3, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 20. Andrej Karpathy ───────────────────────────────────
  {
    githubId: 241138, login: "karpathy", name: "Andrej Karpathy",
    email: "karpathy@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/241138?v=4",
    repos: [
      {
        githubId: 1174820787, name: "autoresearch", fullName: "karpathy/autoresearch",
        url: "https://github.com/karpathy/autoresearch",
        desc: "AI agents running research on single-GPU nanochat training automatically", lang: "Python", stars: 60248,
        issues: [
          { id: 30420, n: 456, title: "CUDA OOM on 24GB GPUs with default config", body: "Default batch size causes OOM on RTX 4090.", complexity: 4, priority: 5, labels: ["bug", "cuda", "oom"], comments: 78, state: "open" },
          { id: 30421, n: 449, title: "Add multi-GPU training support", body: "Currently only supports single GPU. Add DDP support.", complexity: 8, priority: 3, labels: ["enhancement", "multi-gpu"], comments: 45, state: "open" },
          { id: 30422, n: 442, title: "Experiment tracking integration (W&B, MLflow)", body: "Add optional experiment tracking with Weights & Biases.", complexity: 5, priority: 3, labels: ["enhancement", "tracking"], comments: 34, state: "open" },
        ],
        prs: [
          { id: 40420, n: 458, title: "fix: reduce default batch size for 24GB GPUs", additions: 15, deletions: 8, files: 2, reviews: 3, state: "open" },
          { id: 40421, n: 451, title: "feat: multi-GPU DDP training support", additions: 380, deletions: 45, files: 8, reviews: 6, state: "open" },
        ],
      },
      {
        githubId: 582822129, name: "nanoGPT", fullName: "karpathy/nanoGPT",
        url: "https://github.com/karpathy/nanoGPT",
        desc: "The simplest, fastest repository for training/finetuning medium-sized GPTs", lang: "Python", stars: 55766,
        issues: [
          { id: 30430, n: 678, title: "Flash Attention 2 integration", body: "Add Flash Attention 2 for faster training.", complexity: 6, priority: 4, labels: ["enhancement", "performance"], comments: 56, state: "open" },
          { id: 30431, n: 671, title: "BF16 training produces NaN losses", body: "BF16 mixed precision training produces NaN after 10k steps.", complexity: 7, priority: 5, labels: ["bug", "training"], comments: 34, state: "open" },
        ],
        prs: [
          { id: 40430, n: 680, title: "feat: Flash Attention 2 integration", additions: 120, deletions: 35, files: 4, reviews: 5, state: "open" },
          { id: 40431, n: 673, title: "fix: BF16 gradient scaling to prevent NaN", additions: 45, deletions: 12, files: 2, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 1075431749, name: "nanochat", fullName: "karpathy/nanochat",
        url: "https://github.com/karpathy/nanochat",
        desc: "The best ChatGPT that $100 can buy", lang: "Python", stars: 50601,
        issues: [
          { id: 30440, n: 234, title: "Inference speed regression with long contexts", body: "Inference slows 3x for contexts over 4096 tokens.", complexity: 7, priority: 4, labels: ["bug", "performance"], comments: 28, state: "open" },
          { id: 30441, n: 227, title: "Add GGUF export for llama.cpp", body: "Export trained models in GGUF format for llama.cpp inference.", complexity: 5, priority: 3, labels: ["enhancement", "export"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40440, n: 236, title: "perf: KV cache optimization for long contexts", additions: 180, deletions: 45, files: 5, reviews: 4, state: "open" },
        ],
      },
    ],
  },
  // ─── 21. Harrison Chase (LangChain) ────────────────────────
  {
    githubId: 11986836, login: "hwchase17", name: "Harrison Chase",
    email: "hw.chase.17@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/11986836?v=4",
    repos: [
      {
        githubId: 587563574, name: "langchain-hub", fullName: "hwchase17/langchain-hub",
        url: "https://github.com/hwchase17/langchain-hub",
        desc: "LangChain Hub — prompt templates and chains", lang: "Python", stars: 3409,
        issues: [
          { id: 30450, n: 234, title: "Prompt versioning conflicts with LangSmith", body: "Hub prompts don't sync correctly with LangSmith versions.", complexity: 6, priority: 5, labels: ["bug", "langsmith"], comments: 28, state: "open" },
          { id: 30451, n: 227, title: "Add prompt testing framework", body: "Need automated testing for prompt quality and regression.", complexity: 7, priority: 3, labels: ["enhancement", "testing"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40450, n: 236, title: "fix: LangSmith prompt version sync", additions: 120, deletions: 45, files: 5, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 562678926, name: "notion-qa", fullName: "hwchase17/notion-qa",
        url: "https://github.com/hwchase17/notion-qa",
        desc: "Question answering over Notion documents", lang: "Python", stars: 2158,
        issues: [
          { id: 30460, n: 145, title: "Notion API pagination breaks for large workspaces", body: "Pagination cursor expires for workspaces with 10k+ pages.", complexity: 5, priority: 4, labels: ["bug", "notion-api"], comments: 18, state: "open" },
          { id: 30461, n: 138, title: "Add incremental sync instead of full re-index", body: "Full re-indexing is too slow for large workspaces.", complexity: 7, priority: 4, labels: ["enhancement", "performance"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40460, n: 147, title: "fix: handle Notion API pagination cursor expiry", additions: 85, deletions: 25, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 597961855, name: "chat-your-data", fullName: "hwchase17/chat-your-data",
        url: "https://github.com/hwchase17/chat-your-data",
        desc: "Chat with your data using LangChain", lang: "Python", stars: 970,
        issues: [
          { id: 30470, n: 89, title: "PDF parsing fails for scanned documents", body: "OCR-based PDFs return empty text.", complexity: 5, priority: 4, labels: ["bug", "pdf"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40470, n: 91, title: "feat: add OCR fallback for scanned PDFs", additions: 120, deletions: 15, files: 4, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 22. Cassidy Williams ──────────────────────────────────
  {
    githubId: 1454517, login: "cassidoo", name: "Cassidy Williams",
    email: "cassidoo@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/1454517?v=4",
    repos: [
      {
        githubId: 28548699, name: "getting-a-gig", fullName: "cassidoo/getting-a-gig",
        url: "https://github.com/cassidoo/getting-a-gig",
        desc: "Guide for getting a gig as a tech student", lang: "Markdown", stars: 7635,
        issues: [
          { id: 30480, n: 234, title: "Update salary negotiation section for 2025", body: "Salary data is from 2022. Need updated ranges.", complexity: 3, priority: 3, labels: ["enhancement", "content"], comments: 18, state: "open" },
          { id: 30481, n: 228, title: "Add AI/ML career path section", body: "AI/ML roles are now a major career path for students.", complexity: 4, priority: 3, labels: ["enhancement"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40480, n: 236, title: "docs: update salary ranges for 2025", additions: 45, deletions: 30, files: 1, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 89766385, name: "todometer", fullName: "cassidoo/todometer",
        url: "https://github.com/cassidoo/todometer",
        desc: "A meter-based to-do list", lang: "JavaScript", stars: 2057,
        issues: [
          { id: 30490, n: 145, title: "Electron 28 breaks native module compilation", body: "Native modules fail to compile with Electron 28.", complexity: 5, priority: 5, labels: ["bug", "electron"], comments: 12, state: "open" },
          { id: 30491, n: 138, title: "Add cloud sync with GitHub Gists", body: "Sync todo data across devices using GitHub Gists.", complexity: 6, priority: 3, labels: ["enhancement", "sync"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40490, n: 147, title: "fix: Electron 28 native module compilation", additions: 45, deletions: 20, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 11713140, name: "HTML-CSS-Tutorial", fullName: "cassidoo/HTML-CSS-Tutorial",
        url: "https://github.com/cassidoo/HTML-CSS-Tutorial",
        desc: "Tutorial for HTML and CSS", lang: "HTML", stars: 959,
        issues: [
          { id: 30500, n: 89, title: "Add CSS Grid and Flexbox sections", body: "Tutorial only covers floats and positioning.", complexity: 4, priority: 3, labels: ["enhancement", "content"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40500, n: 91, title: "feat: add CSS Grid and Flexbox tutorial sections", additions: 280, deletions: 0, files: 4, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 23. ThePrimeagen ──────────────────────────────────────
  {
    githubId: 4458174, login: "ThePrimeagen", name: "ThePrimeagen",
    email: "theprimeagen@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/4458174?v=4",
    repos: [
      {
        githubId: 310062276, name: "harpoon", fullName: "ThePrimeagen/harpoon",
        url: "https://github.com/ThePrimeagen/harpoon",
        desc: "Neovim file navigation plugin", lang: "Lua", stars: 8972,
        issues: [
          { id: 30510, n: 456, title: "Harpoon 2 marks lost after Neovim crash", body: "Marks are not persisted to disk on crash.", complexity: 5, priority: 5, labels: ["bug", "data-loss"], comments: 34, state: "open" },
          { id: 30511, n: 449, title: "Add telescope.nvim integration", body: "Browse harpoon marks through telescope picker.", complexity: 4, priority: 3, labels: ["enhancement", "telescope"], comments: 22, state: "open" },
          { id: 30512, n: 442, title: "Per-branch mark lists", body: "Different git branches should have different mark lists.", complexity: 6, priority: 3, labels: ["enhancement", "git"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40510, n: 458, title: "fix: persist marks to disk on BufWritePost", additions: 45, deletions: 12, files: 2, reviews: 3, state: "open" },
          { id: 40511, n: 451, title: "feat: telescope.nvim integration", additions: 120, deletions: 0, files: 4, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 1102063859, name: "99", fullName: "ThePrimeagen/99",
        url: "https://github.com/ThePrimeagen/99",
        desc: "Neovim AI agent done right", lang: "Lua", stars: 4466,
        issues: [
          { id: 30520, n: 178, title: "Ollama integration fails with large models", body: "Context window overflow when using 70B models.", complexity: 6, priority: 4, labels: ["bug", "ollama"], comments: 22, state: "open" },
          { id: 30521, n: 171, title: "Add streaming response display", body: "Show AI responses as they stream in, not all at once.", complexity: 5, priority: 4, labels: ["enhancement", "ux"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40520, n: 180, title: "fix: handle context window overflow for large models", additions: 65, deletions: 20, files: 3, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 262700038, name: "vim-be-good", fullName: "ThePrimeagen/vim-be-good",
        url: "https://github.com/ThePrimeagen/vim-be-good",
        desc: "A nvim plugin to make you better at Vim Movements", lang: "Lua", stars: 4409,
        issues: [
          { id: 30530, n: 234, title: "Score tracking resets on plugin update", body: "High scores are lost when updating the plugin.", complexity: 3, priority: 4, labels: ["bug", "data-loss"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40530, n: 236, title: "fix: persist scores in XDG data directory", additions: 35, deletions: 12, files: 2, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 24. Jon Gjengset ──────────────────────────────────────
  {
    githubId: 176295, login: "jonhoo", name: "Jon Gjengset",
    email: "jon@thesquareplanet.com",
    avatar: "https://avatars.githubusercontent.com/u/176295?v=4",
    repos: [
      {
        githubId: 80947295, name: "left-right", fullName: "jonhoo/left-right",
        url: "https://github.com/jonhoo/left-right",
        desc: "A lock-free, read-optimized, concurrency primitive", lang: "Rust", stars: 2140,
        issues: [
          { id: 30540, n: 145, title: "Memory ordering relaxation causes data race on ARM", body: "Relaxed ordering on ARM64 causes stale reads.", complexity: 9, priority: 5, labels: ["bug", "arm64", "concurrency"], comments: 22, state: "open" },
          { id: 30541, n: 138, title: "Add async reader support", body: "Support async/await for read operations.", complexity: 7, priority: 3, labels: ["enhancement", "async"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40540, n: 147, title: "fix: strengthen memory ordering for ARM64 correctness", additions: 45, deletions: 20, files: 3, reviews: 5, state: "open" },
        ],
      },
      {
        githubId: 167734795, name: "inferno", fullName: "jonhoo/inferno",
        url: "https://github.com/jonhoo/inferno",
        desc: "A Rust port of FlameGraph", lang: "Rust", stars: 2072,
        issues: [
          { id: 30550, n: 234, title: "SVG output too large for profiles with 100k+ stacks", body: "SVG file exceeds 50MB for large profiles.", complexity: 6, priority: 4, labels: ["bug", "performance"], comments: 18, state: "open" },
          { id: 30551, n: 227, title: "Add differential flamegraph support", body: "Compare two profiles and show the difference.", complexity: 7, priority: 3, labels: ["enhancement"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40550, n: 236, title: "perf: streaming SVG generation for large profiles", additions: 180, deletions: 65, files: 5, reviews: 4, state: "open" },
        ],
      },
      {
        githubId: 92643295, name: "fantoccini", fullName: "jonhoo/fantoccini",
        url: "https://github.com/jonhoo/fantoccini",
        desc: "A high-level API for programmatically interacting with web pages through WebDriver", lang: "Rust", stars: 1996,
        issues: [
          { id: 30560, n: 345, title: "Chrome 120 WebDriver protocol changes break element clicks", body: "Chrome 120 changed the click behavior for shadow DOM elements.", complexity: 5, priority: 5, labels: ["bug", "chrome"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40560, n: 347, title: "fix: Chrome 120 shadow DOM element click handling", additions: 65, deletions: 20, files: 3, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 25. Evan Wallace (esbuild) ────────────────────────────
  {
    githubId: 406394, login: "evanw", name: "Evan Wallace",
    email: "evanw@users.noreply.github.com",
    avatar: "https://avatars.githubusercontent.com/u/406394?v=4",
    repos: [
      {
        githubId: 61137153, name: "esbuild", fullName: "evanw/esbuild",
        url: "https://github.com/evanw/esbuild",
        desc: "An extremely fast bundler for the web", lang: "Go", stars: 39813,
        issues: [
          { id: 30570, n: 3845, title: "CSS nesting support incomplete for complex selectors", body: "Nested selectors with :has() and :is() produce incorrect output.", complexity: 7, priority: 4, labels: ["bug", "css"], comments: 34, state: "open" },
          { id: 30571, n: 3838, title: "Tree shaking removes used re-exports", body: "Re-exported symbols incorrectly removed when tree shaking.", complexity: 8, priority: 5, labels: ["bug", "tree-shaking"], comments: 56, state: "open" },
          { id: 30572, n: 3831, title: "Add Module Federation support", body: "Support Webpack 5 Module Federation for micro-frontends.", complexity: 9, priority: 3, labels: ["enhancement"], comments: 78, state: "open" },
          { id: 30573, n: 3824, title: "Source map accuracy for minified code", body: "Minified code source maps point to wrong columns.", complexity: 6, priority: 4, labels: ["bug", "sourcemaps"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 40570, n: 3848, title: "fix: CSS nesting with :has() and :is() selectors", additions: 180, deletions: 45, files: 6, reviews: 5, state: "open" },
          { id: 40571, n: 3841, title: "fix: preserve re-exported symbols during tree shaking", additions: 120, deletions: 35, files: 4, reviews: 6, state: "open" },
        ],
      },
      {
        githubId: 617331636, name: "thumbhash", fullName: "evanw/thumbhash",
        url: "https://github.com/evanw/thumbhash",
        desc: "A very compact representation of an image placeholder", lang: "Swift", stars: 4073,
        issues: [
          { id: 30580, n: 89, title: "WASM implementation 3x slower than native", body: "WASM version is significantly slower than the native implementations.", complexity: 5, priority: 3, labels: ["performance", "wasm"], comments: 15, state: "open" },
          { id: 30581, n: 82, title: "Add Python implementation", body: "No official Python implementation available.", complexity: 4, priority: 3, labels: ["enhancement", "python"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40580, n: 91, title: "perf: optimize WASM implementation with SIMD", additions: 120, deletions: 45, files: 3, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 1824090, name: "glfx.js", fullName: "evanw/glfx.js",
        url: "https://github.com/evanw/glfx.js",
        desc: "An image effects library for JavaScript using WebGL", lang: "JavaScript", stars: 3440,
        issues: [
          { id: 30590, n: 178, title: "WebGL2 context creation fails on Safari", body: "Safari requires specific WebGL2 context attributes.", complexity: 4, priority: 4, labels: ["bug", "safari", "webgl2"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40590, n: 180, title: "fix: Safari WebGL2 context creation with fallback", additions: 35, deletions: 8, files: 2, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 26. Tanner Linsley ────────────────────────────────────
  {
    githubId: 5580297, login: "tannerlinsley", name: "Tanner Linsley",
    email: "tannerlinsley@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/5580297?v=4",
    repos: [
      {
        githubId: 244937370, name: "react-query-devtools", fullName: "tannerlinsley/react-query-devtools",
        url: "https://github.com/tannerlinsley/react-query-devtools",
        desc: "Devtools for React Query", lang: "JavaScript", stars: 985,
        issues: [
          { id: 30600, n: 234, title: "Devtools panel crashes with 1000+ queries", body: "Panel becomes unresponsive with many active queries.", complexity: 6, priority: 4, labels: ["bug", "performance"], comments: 22, state: "open" },
          { id: 30601, n: 227, title: "Add query timeline visualization", body: "Show query execution timeline like Chrome DevTools network tab.", complexity: 7, priority: 3, labels: ["enhancement"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40600, n: 236, title: "perf: virtualize query list for large datasets", additions: 180, deletions: 45, files: 5, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 283526290, name: "react-query-essentials", fullName: "tannerlinsley/react-query-essentials",
        url: "https://github.com/tannerlinsley/react-query-essentials",
        desc: "Module source code for the React Query Essentials course", lang: "JavaScript", stars: 446,
        issues: [
          { id: 30610, n: 89, title: "Update examples for TanStack Query v5", body: "Examples still use React Query v3 API.", complexity: 5, priority: 4, labels: ["enhancement", "v5"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40610, n: 91, title: "feat: update all examples to TanStack Query v5", additions: 280, deletions: 220, files: 12, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 99451876, name: "react-show", fullName: "tannerlinsley/react-show",
        url: "https://github.com/tannerlinsley/react-show",
        desc: "A 3kb css animation component for React", lang: "JavaScript", stars: 400,
        issues: [
          { id: 30620, n: 56, title: "React 19 StrictMode double-render breaks animations", body: "Animations play twice in StrictMode.", complexity: 4, priority: 4, labels: ["bug", "react-19"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40620, n: 58, title: "fix: handle React 19 StrictMode double-render", additions: 35, deletions: 12, files: 2, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 27. Lee Robinson ──────────────────────────────────────
  {
    githubId: 9113740, login: "leerob", name: "Lee Robinson",
    email: "leerob@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/9113740?v=4",
    repos: [
      {
        githubId: 162028712, name: "next-mdx-blog", fullName: "leerob/next-mdx-blog",
        url: "https://github.com/leerob/next-mdx-blog",
        desc: "Next.js + MDX blog template with Tailwind CSS and TypeScript", lang: "TypeScript", stars: 7560,
        issues: [
          { id: 30630, n: 456, title: "MDX compilation fails with Next.js 15", body: "MDX pages return 500 error after upgrading to Next.js 15.", complexity: 6, priority: 5, labels: ["bug", "nextjs-15"], comments: 34, state: "open" },
          { id: 30631, n: 449, title: "Add RSS feed generation", body: "Blog template doesn't generate an RSS feed.", complexity: 4, priority: 3, labels: ["enhancement", "rss"], comments: 22, state: "open" },
          { id: 30632, n: 442, title: "Image optimization not working in MDX", body: "Next/Image component doesn't optimize images in MDX files.", complexity: 5, priority: 4, labels: ["bug", "images"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40630, n: 458, title: "fix: MDX compilation with Next.js 15", additions: 120, deletions: 65, files: 5, reviews: 3, state: "open" },
          { id: 40631, n: 451, title: "feat: RSS feed generation from MDX posts", additions: 85, deletions: 0, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 846957113, name: "directories", fullName: "leerob/directories",
        url: "https://github.com/leerob/directories",
        desc: "Find rules and MCP servers", lang: "TypeScript", stars: 3919,
        issues: [
          { id: 30640, n: 178, title: "Search index not updating for new entries", body: "Newly added entries don't appear in search results.", complexity: 4, priority: 4, labels: ["bug", "search"], comments: 15, state: "open" },
          { id: 30641, n: 171, title: "Add category filtering", body: "Filter entries by category (rules, MCP servers, etc.).", complexity: 3, priority: 3, labels: ["enhancement"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40640, n: 180, title: "fix: rebuild search index on new entry submission", additions: 45, deletions: 12, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 868121709, name: "next-self-host", fullName: "leerob/next-self-host",
        url: "https://github.com/leerob/next-self-host",
        desc: "An example deploying Next / Postgres / Nginx to Ubuntu Linux", lang: "TypeScript", stars: 1494,
        issues: [
          { id: 30650, n: 89, title: "Nginx config doesn't handle WebSocket upgrades", body: "WebSocket connections fail through the Nginx reverse proxy.", complexity: 3, priority: 4, labels: ["bug", "nginx"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40650, n: 91, title: "fix: Nginx WebSocket upgrade headers", additions: 15, deletions: 5, files: 1, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 28. Kyle Simpson ──────────────────────────────────────
  {
    githubId: 150330, login: "getify", name: "Kyle Simpson",
    email: "getify@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/150330?v=4",
    repos: [
      {
        githubId: 14440270, name: "You-Dont-Know-JS", fullName: "getify/You-Dont-Know-JS",
        url: "https://github.com/getify/You-Dont-Know-JS",
        desc: "A book series on the JS language", lang: "Markdown", stars: 184545,
        issues: [
          { id: 30660, n: 1845, title: "2nd edition: Scope & Closures chapter needs ES2024 updates", body: "New scoping rules with using declarations not covered.", complexity: 5, priority: 3, labels: ["enhancement", "2nd-edition"], comments: 34, state: "open" },
          { id: 30661, n: 1838, title: "Broken code examples in Async & Performance", body: "Several Promise examples use deprecated patterns.", complexity: 3, priority: 4, labels: ["bug", "content"], comments: 22, state: "open" },
          { id: 30662, n: 1831, title: "Add chapter on Temporal API", body: "Temporal API is stage 3 and widely polyfilled.", complexity: 6, priority: 2, labels: ["enhancement"], comments: 45, state: "open" },
        ],
        prs: [
          { id: 40660, n: 1848, title: "fix: update Promise examples in Async & Performance", additions: 85, deletions: 60, files: 4, reviews: 3, state: "open" },
          { id: 40661, n: 1841, title: "feat: ES2024 using declarations in Scope & Closures", additions: 180, deletions: 0, files: 2, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 65866559, name: "Functional-Light-JS", fullName: "getify/Functional-Light-JS",
        url: "https://github.com/getify/Functional-Light-JS",
        desc: "Pragmatic, balanced FP in JavaScript", lang: "JavaScript", stars: 16789,
        issues: [
          { id: 30670, n: 456, title: "Add Pipeline Operator examples", body: "Pipeline operator (|>) is stage 2. Add examples.", complexity: 4, priority: 2, labels: ["enhancement"], comments: 18, state: "open" },
          { id: 30671, n: 449, title: "TypeScript type annotations for examples", body: "Add TypeScript versions of all FP examples.", complexity: 5, priority: 3, labels: ["enhancement", "typescript"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40670, n: 458, title: "feat: pipeline operator examples", additions: 120, deletions: 0, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 365027, name: "LABjs", fullName: "getify/LABjs",
        url: "https://github.com/getify/LABjs",
        desc: "Loading And Blocking JavaScript: On-demand parallel loader", lang: "HTML", stars: 2266,
        issues: [
          { id: 30680, n: 178, title: "Add ES Module dynamic import() support", body: "LABjs should support native ES Module loading.", complexity: 5, priority: 3, labels: ["enhancement", "esm"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40680, n: 180, title: "feat: ES Module dynamic import() integration", additions: 85, deletions: 20, files: 3, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 29. Mark Otto (Bootstrap) ─────────────────────────────
  {
    githubId: 98681, login: "mdo", name: "Mark Otto",
    email: "mdo@github.com",
    avatar: "https://avatars.githubusercontent.com/u/98681?v=4",
    repos: [
      {
        githubId: 5894096, name: "code-guide", fullName: "mdo/code-guide",
        url: "https://github.com/mdo/code-guide",
        desc: "Standards for developing consistent, flexible, and sustainable HTML and CSS", lang: "SCSS", stars: 8481,
        issues: [
          { id: 30690, n: 345, title: "Add CSS logical properties section", body: "Logical properties (inline/block) should be recommended over physical.", complexity: 3, priority: 3, labels: ["enhancement", "css"], comments: 15, state: "open" },
          { id: 30691, n: 338, title: "Update for CSS nesting and layers", body: "CSS nesting and @layer are now standard.", complexity: 4, priority: 3, labels: ["enhancement"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40690, n: 347, title: "feat: add CSS logical properties guidelines", additions: 65, deletions: 0, files: 1, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 2717454, name: "github-buttons", fullName: "mdo/github-buttons",
        url: "https://github.com/mdo/github-buttons",
        desc: "Showcase GitHub repo or user success with static buttons", lang: "JavaScript", stars: 2887,
        issues: [
          { id: 30700, n: 178, title: "Button count API rate limited", body: "GitHub API rate limiting causes buttons to show 0.", complexity: 4, priority: 4, labels: ["bug", "api"], comments: 18, state: "open" },
          { id: 30701, n: 171, title: "Add dark mode support", body: "Buttons don't adapt to dark mode.", complexity: 3, priority: 3, labels: ["enhancement", "dark-mode"], comments: 12, state: "open" },
        ],
        prs: [
          { id: 40700, n: 180, title: "fix: cache GitHub API responses to avoid rate limiting", additions: 45, deletions: 12, files: 2, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 19681341, name: "wtf-forms", fullName: "mdo/wtf-forms",
        url: "https://github.com/mdo/wtf-forms",
        desc: "Friendlier HTML form controls with a little CSS magic", lang: "CSS", stars: 2683,
        issues: [
          { id: 30710, n: 89, title: "Custom select broken on iOS Safari", body: "Custom select dropdown doesn't open on iOS Safari.", complexity: 4, priority: 5, labels: ["bug", "ios", "safari"], comments: 22, state: "open" },
        ],
        prs: [
          { id: 40710, n: 91, title: "fix: iOS Safari custom select dropdown", additions: 25, deletions: 8, files: 1, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 30. Jess Frazelle ─────────────────────────────────────
  {
    githubId: 1445228, login: "jessfraz", name: "Jess Frazelle",
    email: "jess@linux.com",
    avatar: "https://avatars.githubusercontent.com/u/1445228?v=4",
    repos: [
      {
        githubId: 23929024, name: "dockerfiles", fullName: "jessfraz/dockerfiles",
        url: "https://github.com/jessfraz/dockerfiles",
        desc: "Various Dockerfiles I use on the desktop and on servers", lang: "Dockerfile", stars: 13941,
        issues: [
          { id: 30720, n: 456, title: "Base images using deprecated Ubuntu versions", body: "Several Dockerfiles use Ubuntu 18.04 which is EOL.", complexity: 4, priority: 4, labels: ["bug", "security"], comments: 22, state: "open" },
          { id: 30721, n: 449, title: "Add multi-arch builds for ARM64", body: "Dockerfiles only build for amd64.", complexity: 5, priority: 3, labels: ["enhancement", "arm64"], comments: 18, state: "open" },
          { id: 30722, n: 442, title: "Chrome Dockerfile fails with Puppeteer 22", body: "Chrome Dockerfile doesn't include dependencies for Puppeteer 22.", complexity: 3, priority: 4, labels: ["bug", "chrome"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40720, n: 458, title: "fix: update base images to Ubuntu 24.04", additions: 85, deletions: 85, files: 12, reviews: 3, state: "open" },
          { id: 40721, n: 451, title: "feat: multi-arch builds with Docker Buildx", additions: 120, deletions: 15, files: 8, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 36994655, name: "dotfiles", fullName: "jessfraz/dotfiles",
        url: "https://github.com/jessfraz/dotfiles",
        desc: "My dotfiles. Buyer beware ;)", lang: "Shell", stars: 3546,
        issues: [
          { id: 30730, n: 234, title: "Zsh config conflicts with Oh My Zsh", body: "Custom zsh config breaks when Oh My Zsh is installed.", complexity: 3, priority: 3, labels: ["bug", "zsh"], comments: 12, state: "open" },
          { id: 30731, n: 228, title: "Add Neovim config with LSP", body: "Vim config should be updated to Neovim with native LSP.", complexity: 5, priority: 3, labels: ["enhancement", "neovim"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 40730, n: 236, title: "fix: zsh config compatibility with Oh My Zsh", additions: 25, deletions: 12, files: 2, reviews: 1, state: "open" },
        ],
      },
      {
        githubId: 11525979, name: ".vim", fullName: "jessfraz/.vim",
        url: "https://github.com/jessfraz/.vim",
        desc: "My .vim dotfiles and configurations", lang: "Lua", stars: 648,
        issues: [
          { id: 30740, n: 89, title: "Plugin manager migration from Vundle to lazy.nvim", body: "Vundle is unmaintained. Migrate to lazy.nvim.", complexity: 5, priority: 3, labels: ["enhancement", "migration"], comments: 8, state: "open" },
        ],
        prs: [
          { id: 40740, n: 91, title: "feat: migrate from Vundle to lazy.nvim", additions: 120, deletions: 85, files: 3, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  // ─── 31. Alex Kladov (matklad) ─────────────────────────────
  {
    githubId: 1711539, login: "matklad", name: "Alex Kladov",
    email: "matklad@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/1711539?v=4",
    repos: [
      {
        githubId: 143220272, name: "once_cell", fullName: "matklad/once_cell",
        url: "https://github.com/matklad/once_cell",
        desc: "Rust library for single assignment cells and lazy statics without macros", lang: "Rust", stars: 2073,
        issues: [
          { id: 30750, n: 234, title: "std::sync::LazyLock migration guide", body: "once_cell is now in std. Need migration guide.", complexity: 3, priority: 3, labels: ["documentation"], comments: 22, state: "open" },
          { id: 30751, n: 228, title: "Unsound interaction with panic during initialization", body: "If init panics, subsequent calls may see uninitialized data.", complexity: 8, priority: 5, labels: ["bug", "soundness"], comments: 34, state: "open" },
        ],
        prs: [
          { id: 40750, n: 236, title: "fix: handle panic during initialization safely", additions: 65, deletions: 20, files: 3, reviews: 5, state: "open" },
        ],
      },
      {
        githubId: 215402285, name: "cargo-xtask", fullName: "matklad/cargo-xtask",
        url: "https://github.com/matklad/cargo-xtask",
        desc: "Cargo xtask pattern for project-specific tasks", lang: "Markdown", stars: 1207,
        issues: [
          { id: 30760, n: 89, title: "Add examples for common xtask patterns", body: "Need examples for codegen, release, and CI tasks.", complexity: 4, priority: 3, labels: ["enhancement", "documentation"], comments: 15, state: "open" },
        ],
        prs: [
          { id: 40760, n: 91, title: "docs: add common xtask pattern examples", additions: 180, deletions: 0, files: 3, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 304465394, name: "xshell", fullName: "matklad/xshell",
        url: "https://github.com/matklad/xshell",
        desc: "Ergonomic shell scripting in Rust", lang: "Rust", stars: 812,
        issues: [
          { id: 30770, n: 56, title: "Pipe operator doesn't propagate errors correctly", body: "Piped commands swallow stderr from the first command.", complexity: 5, priority: 4, labels: ["bug", "pipes"], comments: 12, state: "open" },
          { id: 30771, n: 49, title: "Add async command execution", body: "Support tokio-based async command execution.", complexity: 6, priority: 3, labels: ["enhancement", "async"], comments: 8, state: "open" },
        ],
        prs: [
          { id: 40770, n: 58, title: "fix: propagate stderr through pipe chains", additions: 45, deletions: 15, files: 2, reviews: 3, state: "open" },
        ],
      },
    ],
  },
  // ─── 32. Zoltan Kochan (pnpm) ──────────────────────────────
  {
    githubId: 1927579, login: "zkochan", name: "Zoltan Kochan",
    email: "z@kochan.io",
    avatar: "https://avatars.githubusercontent.com/u/1927579?v=4",
    repos: [
      {
        githubId: 150865266, name: "packages", fullName: "zkochan/packages",
        url: "https://github.com/zkochan/packages",
        desc: "Zoltan Kochan's npm packages", lang: "JavaScript", stars: 103,
        issues: [
          { id: 30780, n: 89, title: "symlink-dir fails on Windows with long paths", body: "Windows long path support not handled correctly.", complexity: 4, priority: 4, labels: ["bug", "windows"], comments: 12, state: "open" },
          { id: 30781, n: 82, title: "Add ESM exports to all packages", body: "Packages only export CJS. Need dual ESM/CJS.", complexity: 5, priority: 3, labels: ["enhancement", "esm"], comments: 8, state: "open" },
        ],
        prs: [
          { id: 40780, n: 91, title: "fix: Windows long path support for symlink-dir", additions: 35, deletions: 12, files: 2, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 107908024, name: "package-preview", fullName: "zkochan/package-preview",
        url: "https://github.com/zkochan/package-preview",
        desc: "Creates a production preview of a package", lang: "TypeScript", stars: 82,
        issues: [
          { id: 30790, n: 45, title: "Preview fails for packages with native addons", body: "Native addon compilation not handled in preview mode.", complexity: 6, priority: 4, labels: ["bug", "native"], comments: 8, state: "open" },
        ],
        prs: [
          { id: 40790, n: 47, title: "fix: handle native addon compilation in preview", additions: 85, deletions: 20, files: 4, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 59935908, name: "rcfile", fullName: "zkochan/rcfile",
        url: "https://github.com/zkochan/rcfile",
        desc: "Loads library configuration in all possible ways", lang: "JavaScript", stars: 15,
        issues: [
          { id: 30800, n: 23, title: "Add TOML config file support", body: "Only supports JSON and YAML. Add TOML.", complexity: 3, priority: 2, labels: ["enhancement"], comments: 5, state: "open" },
        ],
        prs: [
          { id: 40800, n: 25, title: "feat: TOML config file support", additions: 45, deletions: 0, files: 3, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  // ─── 33. Tim Neutkens ──────────────────────────────────────
  {
    githubId: 6324199, login: "timneutkens", name: "Tim Neutkens",
    email: "tim@vercel.com",
    avatar: "https://avatars.githubusercontent.com/u/6324199?v=4",
    repos: [
      {
        githubId: 75480395, name: "micro-graphql", fullName: "timneutkens/micro-graphql",
        url: "https://github.com/timneutkens/micro-graphql",
        desc: "Example usage of GraphQL with ZEIT's micro", lang: "JavaScript", stars: 71,
        issues: [
          { id: 30810, n: 34, title: "Migrate from micro to Vercel Functions", body: "micro is deprecated. Migrate to Vercel serverless functions.", complexity: 5, priority: 4, labels: ["migration"], comments: 8, state: "open" },
          { id: 30811, n: 28, title: "Add GraphQL subscriptions example", body: "No WebSocket subscription example.", complexity: 6, priority: 2, labels: ["enhancement"], comments: 5, state: "open" },
        ],
        prs: [
          { id: 40810, n: 36, title: "feat: migrate to Vercel Functions", additions: 120, deletions: 85, files: 5, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 95359369, name: "micro-apollo", fullName: "timneutkens/micro-apollo",
        url: "https://github.com/timneutkens/micro-apollo",
        desc: "Example usage of Apollo GraphQL with ZEIT's micro", lang: "JavaScript", stars: 18,
        issues: [
          { id: 30820, n: 12, title: "Apollo Server 4 migration needed", body: "Still uses Apollo Server 2 which is unmaintained.", complexity: 6, priority: 4, labels: ["migration", "apollo"], comments: 4, state: "open" },
        ],
        prs: [
          { id: 40820, n: 14, title: "feat: migrate to Apollo Server 4", additions: 180, deletions: 120, files: 4, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 76754660, name: "is-async-supported", fullName: "timneutkens/is-async-supported",
        url: "https://github.com/timneutkens/is-async-supported",
        desc: "Check if async/await is available natively", lang: "JavaScript", stars: 16,
        issues: [
          { id: 30830, n: 8, title: "Package is obsolete — async/await is everywhere", body: "All supported Node.js versions have async/await.", complexity: 1, priority: 2, labels: ["documentation"], comments: 3, state: "open" },
        ],
        prs: [
          { id: 40830, n: 10, title: "docs: add deprecation notice", additions: 10, deletions: 0, files: 1, reviews: 1, state: "open" },
        ],
      },
    ],
  },
];

// ─── Seed Functions ──────────────────────────────────────────

async function seedUser(userData: UserData) {
  const user = await prisma.user.upsert({
    where: { email: userData.email },
    update: { name: userData.name, image: userData.avatar },
    create: { name: userData.name, email: userData.email, image: userData.avatar },
  });

  for (const r of userData.repos) {
    const repo = await prisma.repository.upsert({
      where: { githubId: r.githubId },
      update: {},
      create: {
        userId: user.id, githubId: r.githubId, name: r.name, fullName: r.fullName,
        url: r.url, description: r.desc, language: r.lang, starCount: r.stars,
      },
    });

    for (const issue of r.issues) {
      await prisma.issue.upsert({
        where: { repoId_githubId: { repoId: repo.id, githubId: issue.id } },
        update: {},
        create: {
          userId: user.id, repoId: repo.id, githubId: issue.id, number: issue.n,
          title: issue.title, body: issue.body, state: issue.state, labels: issue.labels,
          complexity: issue.complexity, priority: issue.priority, commentCount: issue.comments,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (const pr of r.prs) {
      await prisma.pullRequest.upsert({
        where: { repoId_githubId: { repoId: repo.id, githubId: pr.id } },
        update: {},
        create: {
          userId: user.id, repoId: repo.id, githubId: pr.id, number: pr.n,
          title: pr.title, state: pr.state, additions: pr.additions, deletions: pr.deletions,
          changedFiles: pr.files, reviewComments: pr.reviews,
          complexity: Math.min(Math.ceil((pr.additions + pr.deletions) / 150) + Math.ceil(pr.files / 4), 10),
          createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  const now = new Date();
  const totalIssues = userData.repos.reduce((s, r) => s + r.issues.length, 0);
  const totalPRs = userData.repos.reduce((s, r) => s + r.prs.length, 0);
  const activityLevel = Math.min((totalIssues + totalPRs) / 10, 1);

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const mult = isWeekend ? 0.3 : 1;

    await prisma.dailyAnalytics.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id, date,
        totalFocusMinutes: Math.floor((120 + Math.random() * 240) * mult * (0.5 + activityLevel * 0.5)),
        contextSwitches: Math.floor((2 + Math.random() * 9) * mult * (0.3 + activityLevel * 0.7)),
        avgCognitiveLoad: Math.floor((25 + Math.random() * 50) * (0.5 + activityLevel * 0.5)),
        deepWorkStreaks: Math.floor(Math.random() * 5 * mult),
        peakFocusHour: 9 + Math.floor(Math.random() * 5),
        tasksCompleted: Math.floor(Math.random() * 7 * mult * (0.3 + activityLevel * 0.7)),
      },
    });
  }

  for (let i = 95; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
    const hour = timestamp.getHours();
    const isWorkHour = hour >= 9 && hour <= 18;
    const baseScore = isWorkHour
      ? 30 + activityLevel * 25 + Math.sin(i / 8) * 15
      : 10 + Math.random() * 20;
    const score = Math.max(5, Math.min(95, Math.round(baseScore + (Math.random() - 0.5) * 15)));
    const level = score < 30 ? "flow" : score < 60 ? "moderate" : "overloaded";

    await prisma.cognitiveSnapshot.create({
      data: {
        userId: user.id, score, level, timestamp,
        breakdown: {
          taskLoad: 5 + Math.random() * 35 * activityLevel,
          switchPenalty: Math.random() * 25 * activityLevel,
          reviewLoad: Math.random() * 20 * activityLevel,
          urgencyStress: Math.random() * 30 * activityLevel,
          fatigueIndex: Math.random() * 15,
          staleness: Math.random() * 20 * activityLevel,
        },
        factors: {
          openIssues: userData.repos.reduce((s, r) => s + r.issues.filter((i) => i.state === "open").length, 0),
          openPRs: userData.repos.reduce((s, r) => s + r.prs.filter((p) => p.state === "open").length, 0),
          todaySwitches: Math.floor(Math.random() * 8),
        },
      },
    });
  }

  for (let day = 6; day >= 0; day--) {
    const sessionCount = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < sessionCount; s++) {
      const startedAt = new Date(now);
      startedAt.setDate(startedAt.getDate() - day);
      startedAt.setHours(8 + s * 2 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      const duration = 900 + Math.floor(Math.random() * 5400);
      const interrupted = Math.random() > 0.55;
      await prisma.focusSession.create({
        data: {
          userId: user.id,
          taskType: ["coding", "review", "planning", "debugging", "docs", "meeting"][Math.floor(Math.random() * 6)],
          startedAt,
          endedAt: new Date(startedAt.getTime() + duration * 1000),
          duration, interrupted,
          interruptionCount: interrupted ? 1 + Math.floor(Math.random() * 4) : 0,
        },
      });
    }
  }

  const taskTypes = ["coding", "review", "planning", "debugging", "meeting", "docs", "slack", "email"];
  for (let day = 6; day >= 0; day--) {
    const switchCount = 1 + Math.floor(Math.random() * 6);
    for (let s = 0; s < switchCount; s++) {
      const switchedAt = new Date(now);
      switchedAt.setDate(switchedAt.getDate() - day);
      switchedAt.setHours(9 + Math.floor(s * 1.5), Math.floor(Math.random() * 60), 0, 0);
      const fromIdx = Math.floor(Math.random() * taskTypes.length);
      let toIdx = Math.floor(Math.random() * taskTypes.length);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * taskTypes.length);
      await prisma.contextSwitch.create({
        data: {
          userId: user.id, fromTaskType: taskTypes[fromIdx], toTaskType: taskTypes[toIdx],
          switchedAt, estimatedCost: 8 + Math.random() * 28,
        },
      });
    }
  }

  const totalOpenIssues = userData.repos.reduce((s, r) => s + r.issues.filter((i) => i.state === "open").length, 0);
  const totalOpenPRs = userData.repos.reduce((s, r) => s + r.prs.filter((p) => p.state === "open").length, 0);

  await prisma.agentRecommendation.createMany({
    data: [
      {
        userId: user.id, agent: "focus", type: "break",
        message: `${userData.name}, your cognitive load has been above 70 for 2.5 hours. You have ${totalOpenIssues} open issues across ${userData.repos.length} repos. Take a 20-minute break — historical data shows 38% better task completion after breaks.`,
        priority: "high", estimatedCostMinutes: 20,
        suggestedActions: ["Take a 20-minute break", "Defer non-critical PR reviews", "Hydrate and step away"],
        dismissed: false,
      },
      {
        userId: user.id, agent: "planning", type: "reorder",
        message: `Optimal task order: Start with ${totalOpenPRs} open PRs (review mode is less demanding in the morning), then bug fixes, then feature work. Data shows 42% higher completion rate with this sequencing.`,
        priority: "medium", estimatedCostMinutes: null,
        suggestedActions: ["Start with PR reviews (9-11am)", "Bug fixes after first break (11am-1pm)", "Feature work post-lunch (2-5pm)"],
        dismissed: false,
      },
      {
        userId: user.id, agent: "interrupt-guard", type: "defer",
        message: `New high-complexity issue assigned during your deep work session. Estimated context-switch cost: 26 minutes. You're in a flow state (cognitive load: 38). Recommend deferring for 55 minutes.`,
        priority: "high", estimatedCostMinutes: 26,
        suggestedActions: ["Defer for 55 minutes", "Auto-snooze notifications", "Add to tomorrow's priority queue"],
        dismissed: false,
      },
    ],
  });

  return {
    name: userData.name,
    repos: userData.repos.length,
    issues: userData.repos.reduce((s, r) => s + r.issues.length, 0),
    prs: userData.repos.reduce((s, r) => s + r.prs.length, 0),
  };
}

async function main() {
  console.log(`Seeding Cognitive OS with ${USERS.length} real GitHub developers...\n`);

  for (const userData of USERS) {
    const result = await seedUser(userData);
    console.log(`  + ${result.name} — ${result.repos} repos, ${result.issues} issues, ${result.prs} PRs`);
  }

  const totals = {
    users: USERS.length,
    repos: USERS.reduce((s, u) => s + u.repos.length, 0),
    issues: USERS.reduce((s, u) => s + u.repos.reduce((rs, r) => rs + r.issues.length, 0), 0),
    prs: USERS.reduce((s, u) => s + u.repos.reduce((rs, r) => rs + r.prs.length, 0), 0),
  };

  console.log(`\nSeed complete! ${totals.users} users, ${totals.repos} repos, ${totals.issues} issues, ${totals.prs} PRs`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
