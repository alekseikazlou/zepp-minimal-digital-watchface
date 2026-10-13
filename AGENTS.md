# Repository Guidelines

## Penpot-to-Repository Contract

- Penpot is the read-only source of truth for design-sync tasks. The repository is the mutation target.
- Never modify Penpot or upload repository renders, screenshots, or generated assets to it unless the user explicitly requests a design edit. The Penpot MCP exposes write tools, so begin every connection with a read-only inspection.
- At the start of every sync, state the contract explicitly: `Penpot (read-only) -> repository -> build -> Normal/AOD verification`.
- The only supported target is `480x480-amazfit-balance-2` with a design width of 480.
- Use `design/design-system.json` as the repository-side map of required design frames, target metadata, and verification limits. Inspect only its named Normal, AOD, and tap-zone pages or frames; do not inventory the whole file unless a required frame cannot be found.
- Prefer structured Penpot MCP reads and targeted asset exports. Use Chrome DevTools MCP for plugin activation and visual confirmation as described below.
- Collect the complete design-to-code diff before editing, then apply one focused patch. Do not make one patch per coordinate or asset.
- A routine sync has a budget of 50 tool calls and at most two visual correction loops. If access or runtime failures require more, stop and report the blocker before continuing.
- Use `medium` reasoning for routine syncs when the caller can select effort. Do not use subagents for this single-target workflow.

## Browser and External Access

### Localhost UI debugging

- For pages served from `localhost` or `127.0.0.1`, use Chrome DevTools MCP as the first browser-control mechanism.
- Reuse a matching Chrome tab when available; otherwise open the local URL through Chrome DevTools MCP.
- Inspect DOM, console, network, responses, and relevant runtime state before changing application code.
- Do not silently switch to Computer Use, a browser extension, or another mechanism. Report an attachment blocker and ask before falling back.
- State that Chrome DevTools MCP will be used before browser actions.

### Penpot — official remote MCP by default

- Use the configured official remote MCP server and Penpot MCP Plugin as the default and first access method for Penpot tasks. State that official remote MCP is being used before accessing Penpot and in the final report.
- Use the available `mcp__penpot__*` tools directly. Read `high_level_overview` once per session before other Penpot tools, and consult `penpot_api_info` for the API members needed by the task.
- Verify the plugin connection with a small read-only `execute_code` request returning Penpot version and current file/page names and IDs. A successful documentation request alone does not confirm plugin connectivity.
- Confirm that the connected file, page, and named frames match the requested design before proceeding. Keep the plugin and its Penpot tab open while MCP tools are in use.
- Do not start a local MCP server, run `npx @penpot/mcp`, install local MCP dependencies, or configure localhost endpoints unless explicitly requested. Remote MCP does not require local package-version checks or manual HTTP session initialization.
- Keep Penpot read-only unless design edits are explicitly requested. Keep reads targeted and use screenshots or shape exports for visual verification.
- If remote MCP is unavailable or the plugin is disconnected, report the exact error and the required connection step. Ask before using a local server or another access mechanism.
- If browser interaction is necessary to connect the plugin or visually verify the design, use Chrome DevTools MCP with the dedicated debug Chrome profile. Confirm attachment and Penpot authentication, then reuse an existing matching tab when available. Browser interaction is unnecessary when the remote plugin connection already works and structured reads suffice.
- Never silently switch to Computer Use, a browser extension, or another browser-control mechanism. If Chrome DevTools MCP cannot attach, report the exact blocker and ask before using a fallback. State the actual browser-control mechanism when used.
- Distinguish files, pages, and projects. Do not present the connected file as a complete account project list; report API limitations when the requested listing is unavailable.

## Project Structure & Module Organization

This is a Zepp OS API 4.2 watch-face project. `app.js` owns application-level lifecycle hooks. `watchface/index.js` is the composition root for the watch-face lifecycle, sensors, and refresh timer; keep widget construction in `watchface/domains/{clock,weather,alarm,navigation}/`, frame drawing in `watchface/shell/`, and reusable UI/formatting helpers in `watchface/shared/`. Layout, colors/fonts, and asset paths are in `watchface/config/*.ts`. These config files intentionally use JavaScript-compatible TypeScript syntax because Zeus 1.9.3 bundles them directly; keep TypeScript-only syntax out of runtime config files unless the build pipeline is changed. `app.json` defines metadata, API compatibility, permissions, and the supported device target. Keep device-specific resources under `assets/<resolution>-<device>/`, matching the target key in `app.json`. The ignored `dist/` directory contains temporary generated packages. Immutable preview packages live under `releases/v<version>/` with their manifest and checksum and are tracked by Git.

## Build, Test, and Development Commands

The project has a small `package.json`, while Zeus itself is provided by the globally installed CLI. Run commands from the repository root:

- `npm run typecheck` validates the TypeScript config modules; `npm run check` additionally performs syntax/config/asset validation and one target-specific Zeus build.
- `npm run dev` runs target-specific `zeus dev` and writes its log outside the repository so the watcher cannot rebuild on its own output.
- `npm run preview` (also `npm run preview:release`) requires a clean source tree, builds and uploads a target-specific preview, displays its QR code, and archives the exact uploaded `.zab` under `releases/v<app.version.name>/`. A version cannot be archived twice.
- `npm run preview:zab -- releases/v<version>/<package>.zab` verifies and uploads an archived package without rebuilding it, then displays a fresh QR code. The private uploader is pinned to Zeus CLI 1.9.3 and must be reviewed when Zeus changes.
- `npm run visual:diff -- <penpot.png> <simulator.png> [output.png]` produces a three-panel reference/actual/difference image.
- In a managed sandbox, Zeus may fail with `spawnSync /bin/sh EPERM`; rerun the same command with approval instead of changing the CLI or project.

## Coding Style & Naming Conventions

Use two-space indentation in JavaScript and JSON, single quotes in JavaScript, and no semicolons, consistent with the current files. Keep Zepp lifecycle method names exact (`onCreate`, `onInit`, `build`, `onDestroy`). Prefer descriptive `camelCase` identifiers and uppercase constants for reusable layout values. Name new target asset directories exactly like their `app.json` target key. No formatter or linter is configured, so keep diffs focused and preserve surrounding style.

## Testing Guidelines

There is no automated test suite or coverage threshold. Before submitting a change, run `npm run check`, then exercise it once with `npm run dev` on the single Balance 2 target. Capture Normal and AOD once, combine each Penpot/Simulator pair with `npm run visual:diff`, and inspect the composites for placement, clipping, typography, and readability. Allow at most two correction loops. For hardware-dependent behavior, commit the source state, run `npm run preview` on a compatible watch, and commit the generated release directory after verification. Document which screens and hardware were tested.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no repository-specific commit convention can be inferred. Use short, imperative subjects such as `Add battery indicator`, and keep unrelated changes separate. Pull requests should explain the visible behavior, list validation commands and devices, link the relevant issue, and include before/after screenshots for UI changes. Call out changes to permissions, API versions, target metadata, or generated release artifacts.

## Configuration & Security

Keep permissions in `app.json` minimal. Never commit account tokens, QR-login data, or device identifiers. Update version code and name deliberately for release builds.
Never expose or commit Penpot MCP keys or authenticated remote-MCP URLs. Use the existing configured remote connection; do not copy credentials into repository files, logs, or reports.
Do not save preview QR URLs or Zeus credentials in release manifests. Preserved `.zab` files are release artifacts; never overwrite an existing version directory.
