/**
 * Cognitive OS — Database Seed
 * 5 real GitHub developers with realistic repos, issues, PRs, and 30-day analytics
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

// ─── Real GitHub developers (public data) ────────────────────────────────────

const USERS = [
  {
    githubId: 11247099,
    login: "antfu",
    name: "Anthony Fu",
    email: "antfu7@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/11247099?v=4",
    repos: [
      {
        githubId: 197451023,
        name: "eslint-config",
        fullName: "antfu/eslint-config",
        url: "https://github.com/antfu/eslint-config",
        desc: "Anthony's ESLint config preset — flat config, TypeScript, Vue, React",
        lang: "JavaScript",
        stars: 6061,
        issues: [
          { id: 10001, n: 612, title: "Support for ESLint v9 flat config migration guide", body: "Need comprehensive docs on migrating from legacy .eslintrc to flat config. Many users are confused by the dual-format support.", complexity: 5, priority: 3, labels: ["documentation", "v9"], comments: 18, state: "open" },
          { id: 10002, n: 608, title: "Vue template indentation rules conflict with Prettier", body: "When using the Vue plugin alongside Prettier, template indentation rules create conflicts. The `vue/html-indent` rule fires even when Prettier handles formatting.", complexity: 6, priority: 4, labels: ["bug", "vue", "prettier"], comments: 24, state: "open" },
          { id: 10003, n: 601, title: "Add support for Astro files", body: "With Astro's growing popularity, we need first-class .astro file support. This requires the astro-eslint-parser integration.", complexity: 7, priority: 3, labels: ["enhancement", "astro"], comments: 31, state: "open" },
          { id: 10004, n: 598, title: "TypeScript strict mode causes false positives on generics", body: "The `@typescript-eslint/no-unsafe-assignment` rule fires incorrectly when using complex generic types with conditional types.", complexity: 5, priority: 4, labels: ["bug", "typescript"], comments: 12, state: "open" },
          { id: 10005, n: 591, title: "React hooks rules not applying in .tsx files", body: "The react-hooks/rules-of-hooks rule is not being applied to .tsx files when using the flat config format.", complexity: 4, priority: 5, labels: ["bug", "react", "critical"], comments: 8, state: "open" },
          { id: 10006, n: 585, title: "Add jsonc support for package.json sorting", body: "Add opinionated sorting for package.json keys (name, version, scripts, dependencies, devDependencies order).", complexity: 3, priority: 2, labels: ["enhancement"], comments: 15, state: "open" },
          { id: 10007, n: 579, title: "Performance regression in v2.5 — 3x slower lint times", body: "After upgrading to v2.5, lint times went from 4s to 12s on a 200-file TypeScript project. Profiling shows the issue is in the import resolver.", complexity: 8, priority: 5, labels: ["bug", "performance", "critical"], comments: 42, state: "open" },
        ],
        prs: [
          { id: 20001, n: 614, title: "feat: add Astro file support with astro-eslint-parser", additions: 380, deletions: 20, files: 8, reviews: 5, state: "open" },
          { id: 20002, n: 610, title: "fix: resolve Vue template indentation conflict with Prettier", additions: 95, deletions: 40, files: 4, reviews: 3, state: "open" },
          { id: 20003, n: 605, title: "perf: optimize import resolver for large TypeScript projects", additions: 220, deletions: 180, files: 6, reviews: 7, state: "open" },
          { id: 20004, n: 599, title: "docs: migration guide from legacy .eslintrc to flat config", additions: 450, deletions: 0, files: 3, reviews: 4, state: "merged" },
        ],
      },
      {
        githubId: 917547117,
        name: "node-modules-inspector",
        fullName: "antfu/node-modules-inspector",
        url: "https://github.com/antfu/node-modules-inspector",
        desc: "Interactive UI for local node modules inspection",
        lang: "Vue",
        stars: 2792,
        issues: [
          { id: 10010, n: 145, title: "Add dependency graph visualization with d3-force", body: "The current tree view doesn't show transitive dependency relationships. A force-directed graph would make it much easier to spot circular dependencies.", complexity: 8, priority: 3, labels: ["enhancement", "visualization"], comments: 22, state: "open" },
          { id: 10011, n: 138, title: "Filter by license type (MIT, Apache, GPL)", body: "Enterprise users need to audit license compliance. Add filtering and highlighting for packages with specific licenses.", complexity: 4, priority: 4, labels: ["enhancement", "enterprise"], comments: 11, state: "open" },
          { id: 10012, n: 132, title: "pnpm workspaces support broken in v1.2", body: "When running in a pnpm monorepo, the inspector fails to resolve workspace packages and shows them as external dependencies.", complexity: 5, priority: 5, labels: ["bug", "pnpm", "monorepo"], comments: 17, state: "open" },
          { id: 10013, n: 128, title: "Add bundle size analysis integration", body: "Show estimated bundle size contribution for each package using bundlephobia API or local analysis.", complexity: 6, priority: 3, labels: ["enhancement"], comments: 9, state: "open" },
        ],
        prs: [
          { id: 20010, n: 147, title: "feat: d3-force dependency graph visualization", additions: 680, deletions: 45, files: 12, reviews: 4, state: "open" },
          { id: 20011, n: 141, title: "fix: pnpm workspace package resolution", additions: 120, deletions: 35, files: 5, reviews: 2, state: "open" },
          { id: 20012, n: 135, title: "feat: license type filtering and compliance report", additions: 290, deletions: 15, files: 7, reviews: 3, state: "merged" },
        ],
      },
      {
        githubId: 424297966,
        name: "vitesse-nuxt",
        fullName: "antfu/vitesse-nuxt",
        url: "https://github.com/antfu/vitesse-nuxt",
        desc: "Vitesse for Nuxt 4 — opinionated starter template",
        lang: "TypeScript",
        stars: 1897,
        issues: [
          { id: 10020, n: 89, title: "Upgrade to Nuxt 4 stable release", body: "Nuxt 4 is now stable. Need to update all dependencies and test compatibility with the new file-based routing changes.", complexity: 6, priority: 4, labels: ["upgrade", "nuxt4"], comments: 14, state: "open" },
          { id: 10021, n: 85, title: "Add Pinia store setup with persistence", body: "Include a Pinia store example with pinia-plugin-persistedstate for localStorage persistence.", complexity: 3, priority: 2, labels: ["enhancement", "pinia"], comments: 7, state: "open" },
          { id: 10022, n: 81, title: "i18n setup broken after Nuxt 4 migration", body: "@nuxtjs/i18n v9 has breaking changes that conflict with the current setup. Locale auto-detection no longer works.", complexity: 5, priority: 4, labels: ["bug", "i18n"], comments: 19, state: "open" },
        ],
        prs: [
          { id: 20020, n: 91, title: "chore: upgrade to Nuxt 4 stable with all breaking changes", additions: 340, deletions: 280, files: 18, reviews: 3, state: "open" },
          { id: 20021, n: 87, title: "fix: i18n locale auto-detection for Nuxt 4", additions: 85, deletions: 60, files: 4, reviews: 2, state: "open" },
        ],
      },
    ],
  },
  {
    githubId: 176013,
    login: "wesbos",
    name: "Wes Bos",
    email: "wesbos@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/176013?v=4",
    repos: [
      {
        githubId: 75867720,
        name: "JavaScript30",
        fullName: "wesbos/JavaScript30",
        url: "https://github.com/wesbos/JavaScript30",
        desc: "30 Day Vanilla JS Challenge — build 30 things in 30 days with vanilla JS",
        lang: "HTML",
        stars: 29067,
        issues: [
          { id: 10030, n: 1205, title: "Day 14 LocalStorage: JSON.parse fails on empty storage", body: "When localStorage is empty on first load, JSON.parse(null) throws. Need to add a fallback: `JSON.parse(localStorage.getItem('items') || '[]')`", complexity: 2, priority: 4, labels: ["bug", "day-14"], comments: 8, state: "open" },
          { id: 10031, n: 1198, title: "Day 22 Follow Along Nav: animation jitter on fast hover", body: "When moving the mouse quickly between nav items, the highlight element jitters because getBoundingClientRect is called on each mouseover without debouncing.", complexity: 4, priority: 3, labels: ["bug", "day-22", "animation"], comments: 12, state: "open" },
          { id: 10032, n: 1191, title: "Add TypeScript versions of all 30 exercises", body: "Many learners want TypeScript versions. Could add a /typescript folder with .ts equivalents for each day.", complexity: 9, priority: 2, labels: ["enhancement", "typescript", "good-first-issue"], comments: 45, state: "open" },
          { id: 10033, n: 1184, title: "Day 11 Custom Video Player: fullscreen API deprecated", body: "The webkitRequestFullscreen API is deprecated. Should use the standard requestFullscreen with a webkit fallback.", complexity: 2, priority: 3, labels: ["bug", "day-11", "deprecated-api"], comments: 6, state: "open" },
          { id: 10034, n: 1177, title: "Day 28 Video Speed Controller: mobile touch events missing", body: "The speed scrubber doesn't work on mobile because it only listens to mouse events. Need to add touch event handlers.", complexity: 4, priority: 3, labels: ["bug", "day-28", "mobile"], comments: 9, state: "open" },
          { id: 10035, n: 1170, title: "Update all exercises to use ES2024 features", body: "Many exercises still use older patterns. Could modernize with optional chaining, nullish coalescing, Array.at(), Object.hasOwn(), etc.", complexity: 7, priority: 2, labels: ["enhancement", "modernization"], comments: 28, state: "open" },
        ],
        prs: [
          { id: 20030, n: 1208, title: "fix: Day 14 localStorage empty state JSON.parse error", additions: 8, deletions: 3, files: 1, reviews: 2, state: "open" },
          { id: 20031, n: 1201, title: "fix: Day 22 nav highlight jitter with requestAnimationFrame", additions: 25, deletions: 12, files: 1, reviews: 1, state: "open" },
          { id: 20032, n: 1194, title: "feat: TypeScript versions for days 01-10", additions: 890, deletions: 0, files: 10, reviews: 4, state: "open" },
          { id: 20033, n: 1187, title: "fix: Day 11 fullscreen API with standard + webkit fallback", additions: 15, deletions: 8, files: 1, reviews: 1, state: "merged" },
          { id: 20034, n: 1180, title: "fix: Day 28 add touch event handlers for mobile", additions: 45, deletions: 5, files: 1, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 189282896,
        name: "beginner-javascript",
        fullName: "wesbos/beginner-javascript",
        url: "https://github.com/wesbos/beginner-javascript",
        desc: "Slam Dunk JavaScript — starter files and solutions for the Beginner JavaScript course",
        lang: "HTML",
        stars: 6774,
        issues: [
          { id: 10040, n: 312, title: "Module 12 exercises: fetch API examples use deprecated syntax", body: "Several fetch examples still use .then() chains. Should be updated to async/await for consistency with modern JavaScript.", complexity: 3, priority: 3, labels: ["enhancement", "module-12"], comments: 7, state: "open" },
          { id: 10041, n: 308, title: "Add solution videos for modules 15-20", body: "The course is missing solution walkthroughs for the last 5 modules. Many students are stuck without reference implementations.", complexity: 2, priority: 5, labels: ["content", "missing"], comments: 34, state: "open" },
          { id: 10042, n: 302, title: "Broken starter files for Module 9 Canvas exercises", body: "The canvas starter files reference a missing `utils.js` file. Students get a 404 error when trying to start the exercises.", complexity: 2, priority: 5, labels: ["bug", "module-9", "critical"], comments: 22, state: "open" },
          { id: 10043, n: 298, title: "Add ESM import/export examples to Module 16", body: "Module 16 only covers CommonJS. Should add ES Module examples since browsers now support them natively.", complexity: 4, priority: 3, labels: ["enhancement", "module-16"], comments: 11, state: "open" },
        ],
        prs: [
          { id: 20040, n: 314, title: "fix: Module 9 missing utils.js canvas starter file", additions: 45, deletions: 0, files: 2, reviews: 1, state: "open" },
          { id: 20041, n: 310, title: "fix: Module 12 update fetch examples to async/await", additions: 120, deletions: 95, files: 8, reviews: 2, state: "open" },
          { id: 20042, n: 305, title: "feat: Module 16 ES Module import/export examples", additions: 180, deletions: 20, files: 6, reviews: 3, state: "merged" },
        ],
      },
      {
        githubId: 99754954,
        name: "Advanced-React",
        fullName: "wesbos/Advanced-React",
        url: "https://github.com/wesbos/Advanced-React",
        desc: "Starter Files and Solutions for Full Stack Advanced React and GraphQL",
        lang: "JavaScript",
        stars: 3559,
        issues: [
          { id: 10050, n: 445, title: "GraphQL mutations fail after Apollo Client v3 upgrade", body: "The optimistic UI updates no longer work after upgrading to Apollo Client v3. The cache.modify API has changed.", complexity: 7, priority: 5, labels: ["bug", "apollo", "critical"], comments: 38, state: "open" },
          { id: 10051, n: 438, title: "Migrate from Keystone 5 to Keystone 6", body: "Keystone 5 is EOL. The entire backend needs to be migrated to Keystone 6 which has a completely different schema API.", complexity: 10, priority: 4, labels: ["migration", "keystone", "breaking"], comments: 56, state: "open" },
          { id: 10052, n: 431, title: "Stripe webhook signature verification failing in production", body: "Webhook signature verification works locally but fails in production. Likely a body parsing issue with Next.js API routes.", complexity: 5, priority: 5, labels: ["bug", "stripe", "production"], comments: 19, state: "open" },
        ],
        prs: [
          { id: 20050, n: 447, title: "fix: Apollo Client v3 cache.modify for optimistic updates", additions: 340, deletions: 220, files: 14, reviews: 6, state: "open" },
          { id: 20051, n: 440, title: "fix: Stripe webhook body parsing with Next.js", additions: 45, deletions: 30, files: 3, reviews: 2, state: "merged" },
        ],
      },
    ],
  },
  {
    githubId: 1500684,
    login: "kentcdodds",
    name: "Kent C. Dodds",
    email: "me@kentcdodds.com",
    avatar: "https://avatars.githubusercontent.com/u/1500684?v=4",
    repos: [
      {
        githubId: 338699314,
        name: "mdx-bundler",
        fullName: "kentcdodds/mdx-bundler",
        url: "https://github.com/kentcdodds/mdx-bundler",
        desc: "Give me MDX/TSX strings and I'll give you back a component you can render. Supports imports!",
        lang: "JavaScript",
        stars: 1898,
        issues: [
          { id: 10060, n: 312, title: "esbuild 0.20 breaks CSS module imports in MDX", body: "After esbuild 0.20, CSS module imports inside MDX files throw 'Cannot use import statement outside a module'. The bundler config needs to be updated.", complexity: 7, priority: 5, labels: ["bug", "esbuild", "css-modules"], comments: 28, state: "open" },
          { id: 10061, n: 308, title: "Add support for MDX v3 syntax", body: "MDX v3 introduced new syntax for expressions and JSX. The current bundler only supports MDX v2.", complexity: 8, priority: 4, labels: ["enhancement", "mdx-v3"], comments: 34, state: "open" },
          { id: 10062, n: 302, title: "TypeScript types for bundleMDX return value are wrong", body: "The `code` property in the return type is typed as `string` but can be `undefined` when compilation fails. This causes runtime errors.", complexity: 3, priority: 4, labels: ["bug", "typescript", "types"], comments: 9, state: "open" },
          { id: 10063, n: 298, title: "Support for Shiki syntax highlighting in code blocks", body: "Replace the current Prism-based highlighting with Shiki for better language support and theme consistency.", complexity: 6, priority: 3, labels: ["enhancement", "shiki"], comments: 21, state: "open" },
          { id: 10064, n: 291, title: "Memory leak when bundling large MDX files repeatedly", body: "In a Next.js app that calls bundleMDX on every request, memory usage grows unbounded. The esbuild instance is not being properly cleaned up.", complexity: 7, priority: 5, labels: ["bug", "memory-leak", "performance"], comments: 45, state: "open" },
          { id: 10065, n: 285, title: "Add Vite plugin for mdx-bundler integration", body: "Create a Vite plugin that wraps mdx-bundler for seamless integration with Vite-based projects.", complexity: 7, priority: 2, labels: ["enhancement", "vite"], comments: 16, state: "open" },
        ],
        prs: [
          { id: 20060, n: 314, title: "fix: esbuild 0.20 CSS module import resolution", additions: 180, deletions: 45, files: 5, reviews: 4, state: "open" },
          { id: 20061, n: 310, title: "feat: MDX v3 syntax support", additions: 520, deletions: 180, files: 12, reviews: 6, state: "open" },
          { id: 20062, n: 305, title: "fix: memory leak in esbuild instance lifecycle", additions: 65, deletions: 20, files: 3, reviews: 3, state: "open" },
          { id: 20063, n: 299, title: "fix: TypeScript return type for failed compilation", additions: 12, deletions: 5, files: 2, reviews: 1, state: "merged" },
        ],
      },
      {
        githubId: 96484031,
        name: "babel-plugin-macros",
        fullName: "kentcdodds/babel-plugin-macros",
        url: "https://github.com/kentcdodds/babel-plugin-macros",
        desc: "Allows you to build simple compile-time libraries",
        lang: "JavaScript",
        stars: 2642,
        issues: [
          { id: 10070, n: 198, title: "Babel 8 compatibility — macro resolution fails", body: "Babel 8 changed the plugin API. The current macro resolution logic uses deprecated `babel.types` methods.", complexity: 8, priority: 5, labels: ["bug", "babel-8", "breaking"], comments: 52, state: "open" },
          { id: 10071, n: 192, title: "Add SWC transform support for macros", body: "With the ecosystem moving to SWC, we need a way to run macros in SWC-based toolchains (Next.js, Vite).", complexity: 9, priority: 3, labels: ["enhancement", "swc"], comments: 38, state: "open" },
          { id: 10072, n: 186, title: "Macro import paths not resolved in monorepos", body: "In a pnpm/yarn workspace monorepo, macro imports from sibling packages fail because the resolver doesn't follow workspace symlinks.", complexity: 5, priority: 4, labels: ["bug", "monorepo"], comments: 14, state: "open" },
          { id: 10073, n: 180, title: "TypeScript source maps broken after macro transformation", body: "Source maps point to the wrong lines after macro transformation, making debugging very difficult.", complexity: 6, priority: 4, labels: ["bug", "sourcemaps", "typescript"], comments: 23, state: "open" },
        ],
        prs: [
          { id: 20070, n: 200, title: "fix: Babel 8 plugin API compatibility", additions: 420, deletions: 280, files: 8, reviews: 5, state: "open" },
          { id: 20071, n: 194, title: "fix: monorepo workspace symlink resolution", additions: 85, deletions: 30, files: 4, reviews: 2, state: "open" },
          { id: 20072, n: 188, title: "fix: source map line numbers after transformation", additions: 145, deletions: 60, files: 5, reviews: 3, state: "merged" },
        ],
      },
      {
        githubId: 43512914,
        name: "cross-env",
        fullName: "kentcdodds/cross-env",
        url: "https://github.com/kentcdodds/cross-env",
        desc: "Cross platform setting of environment scripts",
        lang: "TypeScript",
        stars: 6534,
        issues: [
          { id: 10080, n: 412, title: "Windows PowerShell 7 — env vars with spaces not quoted", body: "When an environment variable value contains spaces, PowerShell 7 doesn't handle the quoting correctly. Works fine in cmd.exe.", complexity: 4, priority: 4, labels: ["bug", "windows", "powershell"], comments: 17, state: "open" },
          { id: 10081, n: 408, title: "Add support for .env file loading", body: "Add an option to load variables from a .env file in addition to inline definitions.", complexity: 4, priority: 3, labels: ["enhancement"], comments: 22, state: "open" },
          { id: 10082, n: 401, title: "Node.js 22 deprecation warnings for child_process.exec", body: "Node.js 22 shows deprecation warnings for the exec options we use. Need to update to the new API.", complexity: 3, priority: 4, labels: ["bug", "node-22"], comments: 8, state: "open" },
        ],
        prs: [
          { id: 20080, n: 414, title: "fix: PowerShell 7 env var quoting for values with spaces", additions: 45, deletions: 20, files: 3, reviews: 2, state: "open" },
          { id: 20081, n: 410, title: "fix: Node.js 22 child_process deprecation warnings", additions: 25, deletions: 15, files: 2, reviews: 1, state: "open" },
        ],
      },
    ],
  },
  {
    githubId: 6751787,
    login: "t3dotgg",
    name: "Theo Browne",
    email: "theo@t3.gg",
    avatar: "https://avatars.githubusercontent.com/u/6751787?v=4",
    repos: [
      {
        githubId: 915174137,
        name: "stripe-recommendations",
        fullName: "t3dotgg/stripe-recommendations",
        url: "https://github.com/t3dotgg/stripe-recommendations",
        desc: "How to implement Stripe without going mad — opinionated patterns",
        lang: "TypeScript",
        stars: 6225,
        issues: [
          { id: 10090, n: 145, title: "Stripe Checkout vs Payment Element — when to use which", body: "The README recommends Checkout for most cases but doesn't explain the tradeoffs with Payment Element. Need a decision matrix.", complexity: 3, priority: 4, labels: ["documentation", "stripe-checkout"], comments: 29, state: "open" },
          { id: 10091, n: 138, title: "Webhook idempotency example is missing", body: "The webhook handler doesn't show how to handle duplicate events. Stripe can send the same event multiple times.", complexity: 5, priority: 5, labels: ["bug", "webhooks", "critical"], comments: 41, state: "open" },
          { id: 10092, n: 131, title: "Add example for subscription with usage-based billing", body: "Metered billing is a common pattern but not covered. Need an example with Stripe Meters API.", complexity: 7, priority: 3, labels: ["enhancement", "subscriptions"], comments: 18, state: "open" },
          { id: 10093, n: 124, title: "tRPC + Stripe integration example", body: "Show how to integrate Stripe with tRPC procedures, including type-safe webhook handling.", complexity: 6, priority: 3, labels: ["enhancement", "trpc"], comments: 22, state: "open" },
          { id: 10094, n: 118, title: "Customer portal redirect broken in Next.js App Router", body: "The customer portal redirect uses router.push() but Stripe requires a full page redirect. App Router handles this differently.", complexity: 4, priority: 5, labels: ["bug", "nextjs", "app-router"], comments: 35, state: "open" },
          { id: 10095, n: 112, title: "Add Drizzle ORM example for subscription state management", body: "The current example uses Prisma. Add a Drizzle ORM equivalent since many T3 apps use Drizzle.", complexity: 5, priority: 3, labels: ["enhancement", "drizzle"], comments: 14, state: "open" },
        ],
        prs: [
          { id: 20090, n: 147, title: "fix: webhook idempotency with database deduplication", additions: 180, deletions: 20, files: 5, reviews: 4, state: "open" },
          { id: 20091, n: 141, title: "fix: customer portal redirect for App Router", additions: 35, deletions: 25, files: 2, reviews: 2, state: "open" },
          { id: 20092, n: 135, title: "feat: usage-based billing with Stripe Meters API", additions: 320, deletions: 0, files: 8, reviews: 5, state: "open" },
          { id: 20093, n: 128, title: "docs: tRPC + Stripe type-safe integration", additions: 280, deletions: 0, files: 4, reviews: 3, state: "merged" },
          { id: 20094, n: 122, title: "feat: Drizzle ORM subscription state example", additions: 240, deletions: 0, files: 6, reviews: 3, state: "open" },
        ],
      },
      {
        githubId: 868338493,
        name: "quickpic",
        fullName: "t3dotgg/quickpic",
        url: "https://github.com/t3dotgg/quickpic",
        desc: "Turn SVGs into high resolution PNGs in 2 clicks",
        lang: "TypeScript",
        stars: 1264,
        issues: [
          { id: 10100, n: 89, title: "SVG with external font references fails to render", body: "SVGs that use Google Fonts or other external font URLs don't render the fonts correctly. Need to inline font data.", complexity: 6, priority: 4, labels: ["bug", "fonts"], comments: 15, state: "open" },
          { id: 10101, n: 84, title: "Add batch SVG to PNG conversion", body: "Allow users to upload multiple SVGs and download a ZIP of all converted PNGs.", complexity: 5, priority: 3, labels: ["enhancement", "batch"], comments: 12, state: "open" },
          { id: 10102, n: 79, title: "CORS error when converting SVGs from external URLs", body: "When pasting an external SVG URL, the fetch fails due to CORS. Need a server-side proxy.", complexity: 4, priority: 4, labels: ["bug", "cors"], comments: 8, state: "open" },
          { id: 10103, n: 74, title: "Output quality degraded for SVGs with complex gradients", body: "SVGs with radial gradients and complex stops lose quality at 2x scale. The canvas renderer doesn't handle them correctly.", complexity: 7, priority: 3, labels: ["bug", "quality", "gradients"], comments: 19, state: "open" },
        ],
        prs: [
          { id: 20100, n: 91, title: "fix: inline external font references in SVG renderer", additions: 145, deletions: 30, files: 4, reviews: 2, state: "open" },
          { id: 20101, n: 86, title: "feat: batch SVG to PNG with ZIP download", additions: 280, deletions: 15, files: 7, reviews: 3, state: "open" },
          { id: 20102, n: 81, title: "fix: CORS proxy for external SVG URL fetching", additions: 65, deletions: 10, files: 3, reviews: 1, state: "merged" },
        ],
      },
      {
        githubId: 613705461,
        name: "chirp",
        fullName: "t3dotgg/chirp",
        url: "https://github.com/t3dotgg/chirp",
        desc: "Twitter clone built with T3 stack — Next.js, tRPC, Prisma, Tailwind",
        lang: "TypeScript",
        stars: 396,
        issues: [
          { id: 10110, n: 56, title: "Infinite scroll breaks when navigating back", body: "When a user navigates to a chirp detail page and presses back, the infinite scroll position resets to the top.", complexity: 5, priority: 4, labels: ["bug", "ux"], comments: 11, state: "open" },
          { id: 10111, n: 52, title: "Add image upload support with Uploadthing", body: "Users should be able to attach images to chirps. Integrate Uploadthing for file handling.", complexity: 6, priority: 3, labels: ["enhancement", "uploadthing"], comments: 8, state: "open" },
          { id: 10112, n: 48, title: "Rate limiting on chirp creation endpoint", body: "Without rate limiting, a single user can spam thousands of chirps. Add tRPC middleware for rate limiting.", complexity: 4, priority: 5, labels: ["security", "rate-limiting"], comments: 14, state: "open" },
        ],
        prs: [
          { id: 20110, n: 58, title: "fix: preserve infinite scroll position on back navigation", additions: 95, deletions: 40, files: 4, reviews: 2, state: "open" },
          { id: 20111, n: 54, title: "feat: image upload with Uploadthing integration", additions: 340, deletions: 20, files: 9, reviews: 4, state: "open" },
        ],
      },
    ],
  },
  {
    githubId: 124599,
    login: "shadcn",
    name: "shadcn",
    email: "shadcn@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
    repos: [
      {
        githubId: 624275469,
        name: "tiktokenizer",
        fullName: "shadcn/tiktokenizer",
        url: "https://github.com/shadcn/tiktokenizer",
        desc: "Online playground for OpenAPI tokenizers — visualize token counts",
        lang: "TypeScript",
        stars: 8,
        issues: [
          { id: 10120, n: 34, title: "Add support for Claude tokenizer (Anthropic)", body: "Currently only supports OpenAI tokenizers. Add Anthropic's tokenizer for Claude models.", complexity: 6, priority: 4, labels: ["enhancement", "anthropic"], comments: 18, state: "open" },
          { id: 10121, n: 31, title: "Token count differs from OpenAI Playground", body: "For certain Unicode characters and emoji, the token count shown differs from what OpenAI Playground shows.", complexity: 5, priority: 5, labels: ["bug", "accuracy"], comments: 24, state: "open" },
          { id: 10122, n: 28, title: "Add cost estimation per model", body: "Show estimated API cost based on token count and selected model pricing.", complexity: 3, priority: 3, labels: ["enhancement", "pricing"], comments: 12, state: "open" },
          { id: 10123, n: 25, title: "Syntax highlighting for code blocks in input", body: "When pasting code into the tokenizer, add syntax highlighting to make it easier to see how code is tokenized.", complexity: 5, priority: 2, labels: ["enhancement", "ux"], comments: 7, state: "open" },
          { id: 10124, n: 22, title: "Share button to create permalink with current text", body: "Add a share button that creates a URL with the current text encoded so users can share tokenization examples.", complexity: 3, priority: 3, labels: ["enhancement", "sharing"], comments: 9, state: "open" },
        ],
        prs: [
          { id: 20120, n: 36, title: "feat: Claude tokenizer support via tiktoken-node", additions: 280, deletions: 45, files: 8, reviews: 3, state: "open" },
          { id: 20121, n: 33, title: "fix: Unicode emoji token count accuracy", additions: 65, deletions: 20, files: 3, reviews: 2, state: "open" },
          { id: 20122, n: 29, title: "feat: cost estimation with model pricing table", additions: 145, deletions: 10, files: 5, reviews: 2, state: "merged" },
          { id: 20123, n: 26, title: "feat: shareable permalink with base64-encoded text", additions: 85, deletions: 5, files: 4, reviews: 1, state: "open" },
        ],
      },
      {
        githubId: 17321805,
        name: "license-generator",
        fullName: "shadcn/license-generator",
        url: "https://github.com/shadcn/license-generator",
        desc: "Generates a license for your open source project",
        lang: "JavaScript",
        stars: 170,
        issues: [
          { id: 10130, n: 78, title: "Add EUPL (European Union Public License)", body: "EUPL is required for EU government projects. Add support for EUPL 1.2.", complexity: 2, priority: 3, labels: ["enhancement", "license"], comments: 5, state: "open" },
          { id: 10131, n: 74, title: "Year auto-detection uses server time not user time", body: "The generated license year uses the server's timezone. Should use the user's local time.", complexity: 2, priority: 3, labels: ["bug", "timezone"], comments: 4, state: "open" },
          { id: 10132, n: 70, title: "Add organization name support for Apache 2.0", body: "Apache 2.0 licenses often use an organization name instead of an individual name.", complexity: 2, priority: 2, labels: ["enhancement"], comments: 6, state: "open" },
          { id: 10133, n: 66, title: "CLI tool for generating licenses from terminal", body: "Add a CLI tool so developers can generate licenses without visiting the website.", complexity: 5, priority: 3, labels: ["enhancement", "cli"], comments: 14, state: "open" },
        ],
        prs: [
          { id: 20130, n: 80, title: "feat: add EUPL 1.2 license template", additions: 45, deletions: 0, files: 2, reviews: 1, state: "open" },
          { id: 20131, n: 76, title: "fix: use client timezone for year detection", additions: 12, deletions: 8, files: 1, reviews: 1, state: "merged" },
          { id: 20132, n: 72, title: "feat: CLI tool for terminal license generation", additions: 180, deletions: 0, files: 5, reviews: 2, state: "open" },
        ],
      },
      {
        githubId: 887393648,
        name: "shadcn-electron-app",
        fullName: "shadcn/shadcn-electron-app",
        url: "https://github.com/shadcn/shadcn-electron-app",
        desc: "electron-vite + shadcn/ui — desktop app starter template",
        lang: "TypeScript",
        stars: 152,
        issues: [
          { id: 10140, n: 45, title: "Auto-updater integration with electron-updater", body: "Add electron-updater for automatic app updates from GitHub releases.", complexity: 6, priority: 4, labels: ["enhancement", "auto-update"], comments: 16, state: "open" },
          { id: 10141, n: 41, title: "Dark mode sync with system preference", body: "The app doesn't respond to system dark mode changes. Need to use nativeTheme.themeSource.", complexity: 3, priority: 4, labels: ["bug", "dark-mode"], comments: 9, state: "open" },
          { id: 10142, n: 38, title: "Code signing setup for macOS and Windows", body: "Add documentation and scripts for code signing. Without it, users get security warnings on macOS and Windows.", complexity: 5, priority: 5, labels: ["documentation", "security", "distribution"], comments: 21, state: "open" },
          { id: 10143, n: 35, title: "Add SQLite integration with better-sqlite3", body: "Most desktop apps need local storage. Add a better-sqlite3 example with type-safe queries.", complexity: 5, priority: 3, labels: ["enhancement", "sqlite"], comments: 12, state: "open" },
          { id: 10144, n: 32, title: "IPC type safety between main and renderer", body: "The current IPC setup uses untyped channels. Add a type-safe IPC layer using electron-trpc or similar.", complexity: 7, priority: 4, labels: ["enhancement", "typescript", "ipc"], comments: 18, state: "open" },
        ],
        prs: [
          { id: 20140, n: 47, title: "feat: auto-updater with electron-updater and GitHub releases", additions: 280, deletions: 15, files: 8, reviews: 3, state: "open" },
          { id: 20141, n: 43, title: "fix: dark mode sync with nativeTheme", additions: 35, deletions: 20, files: 3, reviews: 1, state: "open" },
          { id: 20142, n: 39, title: "feat: type-safe IPC with electron-trpc", additions: 320, deletions: 45, files: 10, reviews: 4, state: "open" },
          { id: 20143, n: 36, title: "docs: code signing guide for macOS and Windows", additions: 180, deletions: 0, files: 2, reviews: 2, state: "merged" },
        ],
      },
    ],
  },
];

async function seedUser(userData: typeof USERS[0]) {
  const user = await prisma.user.upsert({
    where: { email: userData.email },
    update: { name: userData.name, image: userData.avatar },
    create: { name: userData.name, email: userData.email, image: userData.avatar },
  });

  const allRepos = [];
  for (const r of userData.repos) {
    const repo = await prisma.repository.upsert({
      where: { githubId: r.githubId },
      update: {},
      create: {
        userId: user.id,
        githubId: r.githubId,
        name: r.name,
        fullName: r.fullName,
        url: r.url,
        description: r.desc,
        language: r.lang,
        starCount: r.stars,
      },
    });
    allRepos.push(repo);

    for (const issue of r.issues) {
      await prisma.issue.upsert({
        where: { repoId_githubId: { repoId: repo.id, githubId: issue.id } },
        update: {},
        create: {
          userId: user.id,
          repoId: repo.id,
          githubId: issue.id,
          number: issue.n,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          labels: issue.labels,
          complexity: issue.complexity,
          priority: issue.priority,
          commentCount: issue.comments,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (const pr of r.prs) {
      await prisma.pullRequest.upsert({
        where: { repoId_githubId: { repoId: repo.id, githubId: pr.id } },
        update: {},
        create: {
          userId: user.id,
          repoId: repo.id,
          githubId: pr.id,
          number: pr.n,
          title: pr.title,
          state: pr.state,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.files,
          reviewComments: pr.reviews,
          complexity: Math.min(Math.ceil((pr.additions + pr.deletions) / 150) + Math.ceil(pr.files / 4), 10),
          createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  const now = new Date();

  // 30 days of daily analytics
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    await prisma.dailyAnalytics.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        totalFocusMinutes: isWeekend ? 30 + Math.floor(Math.random() * 90) : 120 + Math.floor(Math.random() * 240),
        contextSwitches: isWeekend ? Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 9),
        avgCognitiveLoad: isWeekend ? 15 + Math.floor(Math.random() * 25) : 30 + Math.floor(Math.random() * 45),
        deepWorkStreaks: isWeekend ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 5),
        peakFocusHour: 9 + Math.floor(Math.random() * 5),
        tasksCompleted: isWeekend ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 7),
      },
    });
  }

  // 48h of cognitive snapshots (every 30 min)
  for (let i = 95; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
    const hour = timestamp.getHours();
    const isWorkHour = hour >= 9 && hour <= 18;
    const baseScore = isWorkHour ? 35 + Math.sin(i / 8) * 20 : 15 + Math.random() * 20;
    const score = Math.max(5, Math.min(95, Math.round(baseScore + (Math.random() - 0.5) * 15)));
    const level = score < 40 ? "flow" : score < 70 ? "moderate" : "overloaded";

    await prisma.cognitiveSnapshot.create({
      data: {
        userId: user.id,
        score,
        level,
        breakdown: {
          taskLoad: 5 + Math.random() * 35,
          switchPenalty: Math.random() * 25,
          reviewLoad: Math.random() * 20,
          urgencyStress: Math.random() * 30,
          fatigueIndex: Math.random() * 15,
          staleness: Math.random() * 20,
        },
        factors: {
          openIssues: userData.repos.reduce((s, r) => s + r.issues.filter((i) => i.state === "open").length, 0),
          openPRs: userData.repos.reduce((s, r) => s + r.prs.filter((p) => p.state === "open").length, 0),
          todaySwitches: Math.floor(Math.random() * 8),
        },
        timestamp,
      },
    });
  }

  // 7 days of focus sessions (2-5 per day)
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
          duration,
          interrupted,
          interruptionCount: interrupted ? 1 + Math.floor(Math.random() * 4) : 0,
        },
      });
    }
  }

  // 7 days of context switches (1-6 per day)
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
          userId: user.id,
          fromTaskType: taskTypes[fromIdx],
          toTaskType: taskTypes[toIdx],
          switchedAt,
          estimatedCost: 8 + Math.random() * 28,
        },
      });
    }
  }

  // Agent recommendations
  const totalOpenIssues = userData.repos.reduce((s, r) => s + r.issues.filter((i) => i.state === "open").length, 0);
  const totalOpenPRs = userData.repos.reduce((s, r) => s + r.prs.filter((p) => p.state === "open").length, 0);

  await prisma.agentRecommendation.createMany({
    data: [
      {
        userId: user.id,
        agent: "focus",
        type: "break",
        message: `${userData.name}, your cognitive load has been above 70 for 2.5 hours. You have ${totalOpenIssues} open issues across ${userData.repos.length} repos. Take a 20-minute break before continuing — your historical recovery data shows 38% better task completion after breaks.`,
        priority: "high",
        estimatedCostMinutes: 20,
        suggestedActions: ["Take a 20-minute break", "Defer non-critical PR reviews", "Hydrate and step away from screen"],
        dismissed: false,
      },
      {
        userId: user.id,
        agent: "planning",
        type: "reorder",
        message: `Optimal task order for today: Start with the ${totalOpenPRs} open PRs (review mode is less cognitively demanding in the morning), then move to bug fixes, then feature work. Your data shows 42% higher completion rate with this sequencing.`,
        priority: "medium",
        estimatedCostMinutes: null,
        suggestedActions: ["Start with PR reviews (9-11am)", "Bug fixes after first break (11am-1pm)", "Feature work post-lunch (2-5pm)"],
        dismissed: false,
      },
      {
        userId: user.id,
        agent: "interrupt-guard",
        type: "defer",
        message: `New high-complexity issue assigned during your deep work session. Estimated context-switch cost: 26 minutes. You're currently in a flow state (cognitive load: 38). Recommend deferring for 55 minutes until your current focus block ends.`,
        priority: "high",
        estimatedCostMinutes: 26,
        suggestedActions: ["Defer for 55 minutes", "Auto-snooze GitHub notifications", "Add to tomorrow's priority queue"],
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
  console.log("Seeding Cognitive OS with 5 real GitHub developers...\n");

  for (const userData of USERS) {
    const result = await seedUser(userData);
    console.log(`  ✓ ${result.name} — ${result.repos} repos, ${result.issues} issues, ${result.prs} PRs`);
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
