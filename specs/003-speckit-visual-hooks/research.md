# Phase 0 Research: Speckit Visual Reference Hooks

This document resolves every "NEEDS CLARIFICATION" implied by the Technical Context block of `plan.md`. Each entry is structured as **Decision / Rationale / Alternatives considered**.

## R1. Speckit hook invocation contract

**Decision**: A speckit hook is a slash command (Markdown file under an extension's `commands/`) that the host slash command invokes after writing its primary file. The hook runs inside the same Claude session and may shell out to deterministic scripts. Hooks marked `optional: false` (mandatory) always run; failure of a mandatory hook does **not** abort the parent command — the parent reports SUCCESS for its own write and surfaces the hook failure as a non-fatal warning. This matches the user-confirmed behaviour in clarification Q1 and is consistent with the existing git extension's "Warning: Git repository not detected; skipped …" graceful-degradation pattern.

**Rationale**: Treating the visual hook as a slash command (not a binary that mutates files behind the host's back) keeps it diagnosable, gives it access to the LLM context if needed, and lets the bash/powershell mirror choice follow the project-wide `.specify/init-options.json` `script` setting. Treating mandatory failures as warnings preserves the spec the author already invested time in.

**Alternatives considered**:
- *Hard-fail on mandatory hook error*: rejected. Would force authors to re-run `/speckit-specify` from scratch on a regex bug or a transient IO failure, destroying the spec they just wrote.
- *Silent failure*: rejected by clarification Q1. Hides regression from authors and from CI.

## R2. Aggregator merge mechanics for `.specify/extensions.yml`

**Decision**: Hand-edit `.specify/extensions.yml` to add two new entries — one under `hooks.after_specify` and one under `hooks.after_tasks` — placing them as the **first** entry on each list. Also ship `.specify/extensions/visual-refs/extension.yml` with matching declarations under its own `hooks:` block, so that a future `specify install` / re-init regenerates the aggregator with our hooks in the right place.

**Rationale**: The aggregator file in this project (4332 bytes, mirrors the git extension's `extension.yml` `hooks:` block) is the authoritative live config — it's the file `/speckit-*` slash commands actually read. Speckit's installer composes it from each extension's own `extension.yml`, but we cannot re-run the installer mid-feature without risking churn on the git extension's existing entries. Hand-editing the aggregator keeps the diff surgical; shipping a parity `extension.yml` ensures the visual extension behaves identically if someone re-runs the installer later.

**Alternatives considered**:
- *Only edit the aggregator*: rejected. Future re-installs would silently drop our hooks because no source extension declares them.
- *Only ship `extension.yml` and trigger a re-install in tasks*: rejected. Re-install would touch the git entries and risk reordering, breaking SC-005's byte-identical guarantee for the unaffected entries.

## R3. PNG/SVG reference detection in the `**Input**:` line

**Decision**: Use a single multi-alternative regex over the captured input string, run via `grep -oE` (bash) or `[regex]::Matches` (PowerShell). The regex matches any whitespace-delimited token whose payload, after stripping wrapping `"`, `'`, `<`, `>`, and trailing `.,;:)`, ends in a case-insensitive `.png` or `.svg` (optionally followed by a `?`-prefixed query string). Matched payloads are then classified:

- starts with `https?://` → URL
- matches `^[A-Za-z]:\\` or `^\\\\` → Windows path
- matches `^/` or `^\./` or `^\.\./` → POSIX path
- otherwise → bare relative path (kept as-is, with original casing)

Deduplication uses the **post-strip, original-casing** payload as the key (URLs stay as-is; paths are not lower-cased on Windows so SC-005 byte-identical guarantees hold for unrelated specs).

**Rationale**: Authors paste paths in many shapes (`C:\designs\hero.png`, `/Users/x/icon.svg`, `<https://cdn.example/a.svg>`, `"hero.png"`). A single permissive regex with explicit post-trim is easier to audit than a regex that tries to match every shape pre-emptively. Stripping common wrap chars handles natural-language sentences like `the design is at "hero.png".` without overreach.

**Alternatives considered**:
- *Per-shape regexes* (URL, Windows, POSIX, bare): rejected. Multiplicative complexity; harder to keep bash and PowerShell in sync.
- *Markdown link parsing only* (`![alt](path)`): rejected. Authors don't always wrap in markdown link syntax — and our input source is the raw `**Input**:` quoted string, not a rendered body.
- *Lower-case the dedup key*: rejected on Windows (would corrupt original casing on the rendered list, violating "preserve original casing" in spec acceptance scenario 2).

## R4. Idempotent prepended task in `tasks.md`

**Decision**: Wrap the prepended task in HTML-comment delimiters that the after_tasks hook owns:

```markdown
<!-- visual-context-task:start -->
- [ ] **T000** Load visual references from `spec.md`
  - <name1>: <path1>
  - <name2>: <path2>
<!-- visual-context-task:end -->
```

On every run, the hook removes any existing `start…end` block (matching the literal markers) and re-emits a fresh one if `spec.md` has a non-empty Visual References section; emits nothing otherwise. The block is always followed by a single blank line before the rest of `tasks.md` so existing content stays untouched.

**Rationale**: HTML comments are invisible in rendered Markdown but unambiguous to the script. Owning a delimited region (rather than scanning for "looks like a T000 task") makes idempotency trivial — the script does a single delete-and-replace. T000 (rather than mutating T001…) keeps the existing task numbering stable and signals "phase zero, before the canonical tasks" to the implementer. This satisfies FR-006 and SC-002.

**Alternatives considered**:
- *Insert as T001 and renumber the rest*: rejected. Renumbering breaks any downstream issue tracker that referenced specific T-numbers.
- *Append as a postfix instead of prefix*: rejected by FR-005, which requires execution before any other task.
- *Use a magic emoji or unicode marker for delimiters*: rejected. Less greppable; risk of false positives.

## R5. Cross-platform script parity

**Decision**: Ship bash (`extract-refs.sh`, `prepend-task.sh`) and PowerShell (`extract-refs.ps1`, `prepend-task.ps1`) implementations. The two slash-command Markdown files (`speckit.visual.extract-refs.md`, `speckit.visual.prepend-task.md`) follow the same convention as `speckit.git.feature.md`: list both invocation forms and rely on the host's `script` setting in `.specify/init-options.json` (`"sh"` for this project) to pick. The active path is bash; PowerShell is a maintained mirror.

**Rationale**: Matches the existing git-extension convention, keeps the project cross-platform without requiring Node for the hooks themselves, and avoids introducing a new runtime (Python, Deno, etc.) just to do regex over a small text file.

**Alternatives considered**:
- *Bash-only, with WSL recommended on Windows*: rejected. Other speckit extensions in this tree are bilingual; a single-shell extension would be an outlier and would fail for Windows-only contributors.
- *Node.js implementation*: rejected. Pulls Node into the hot path of every `/speckit-specify` and `/speckit-tasks`, increasing latency and conflicting with Constitution II's "no new dependencies" preference.

## R6. Test approach (Playwright meta-test, no browser fixture)

**Decision**: The Playwright test file (`tests/003-speckit-visual-hooks.ts`) imports `test, expect` from `@playwright/test` and writes one top-level `test(...)` per user story (US1, US2). Each test:

1. Creates a temporary spec dir under `os.tmpdir()` and seeds a minimal `spec.md` (and `tasks.md` for US2) with a known `**Input**:` line.
2. Spawns the bash script via `child_process.execFileSync` (or `pwsh` on Windows CI) with the temp file as argument.
3. Asserts on the resulting file contents byte-by-byte (for the no-references case → unchanged) or via line-level fixtures (for the populated case).

No `page` fixture, no browser install needed for these specific tests. This mirrors the meta-test exemption explicitly noted in `CLAUDE.md` for feature 002 ("this feature's own meta-tests do not [need a page fixture]").

**Rationale**: Constitution requires one Playwright test file per feature, one `test(...)` per user story. This feature is a tooling change with no UI surface — driving the scripts directly is the only way to satisfy the policy meaningfully. Playwright's `test()` function works fine without `page`; the runner just orchestrates assertions.

**Alternatives considered**:
- *Skip Playwright and write a bash test harness*: rejected. Constitution mandates Playwright as the test runner; consistency with feature 002's policy matters more than runtime fit.
- *Use Playwright's `request` fixture against a local file:// server*: rejected. Adds a server boot per test for no benefit over `child_process`.

## R7. Source extraction from `spec.md` `**Input**:` line vs. session transcript

**Decision**: (Confirmed by clarification Q3) Parse the literal line in `spec.md` matching the regex `^\*\*Input\*\*: User description: "(.+)"\s*$` (single line, since `/speckit-specify` writes the input as a one-line quoted string). The captured group is the source text fed into R3's reference detector.

**Rationale**: The line is persisted by `/speckit-specify` regardless of session state, survives compaction, and works for re-runs of the hook. No external context needed.

**Edge handling**: If the Input line contains escaped quotes or spans multiple physical lines (theoretical, since `/speckit-specify` writes a one-liner today), the regex falls back to a non-greedy match that accepts content up to the next line ending in a closing quote. If even that fails, the hook reports the parse failure via R1's warning channel and writes no Visual References section.

**Alternatives considered**:
- *YAML front-matter parsing*: rejected. `spec.md` does not use YAML front-matter; the `**Input**:` line is bold-Markdown, not YAML.
- *JSON-side-channel between /specify and the hook*: rejected. Adds a temp file with no benefit over reading the canonical `spec.md`.
