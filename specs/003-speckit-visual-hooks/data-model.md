# Phase 1 Data Model: Speckit Visual Reference Hooks

This feature has no database. The "data model" is the on-disk representation of three entities: extracted visual references, the prepended visual-context task, and the hook registration metadata that wires the two scripts into the speckit lifecycle. Each entity below states its location, fields, validation rules, and lifecycle.

## Entity 1: Visual Reference

**Location on disk**: A bullet line under the `## Visual References` section of `specs/<dir>/spec.md`.

**Fields**:

| Field | Type | Source | Validation |
|---|---|---|---|
| `name` | string (filename basename) | computed from `link` via POSIX/Windows path split | non-empty; must end in `.png` or `.svg` (case-insensitive) |
| `link` | string (full path or URL, original casing) | regex match on `**Input**:` line of `spec.md` | must match one of: `https?://…`, `^[A-Za-z]:\\…`, `^\\\\…`, `^/…`, `^\./…`, `^\.\./…`, or a bare token ending in the recognized extension |

**Serialized form** (one bullet per reference):

```markdown
- <name>: <link>
```

Example:

```markdown
- hero.png: C:\Users\arthur.santos\designs\hero.png
- icon.svg: https://cdn.example.com/icons/icon.svg
```

**Identity / uniqueness**: The unique key is the `link` string after wrap/punct stripping (see research R3). Original casing is preserved.

**Lifecycle**:
1. Created by the after_specify hook at the time `/speckit-specify` finishes writing `spec.md`.
2. Persisted in `spec.md`. Manually editable thereafter — manual edits are honored on the next `/speckit-tasks` run.
3. Deleted only by hand-editing the section (the hooks never remove references on subsequent runs of the same feature).

## Entity 2: Visual-Context Task

**Location on disk**: The leading delimited block of `specs/<dir>/tasks.md`.

**Fields**:

| Field | Type | Source | Validation |
|---|---|---|---|
| `start_marker` | literal HTML comment | constant | exact text: `<!-- visual-context-task:start -->` |
| `task_id` | literal | constant | exact text: `T000` |
| `summary` | literal | constant | exact text: `Load visual references from \`spec.md\`` |
| `references[]` | list of (name, link) pairs | mirrors entity 1 from `spec.md` | each pair indented two spaces, formatted `- <name>: <link>` |
| `end_marker` | literal HTML comment | constant | exact text: `<!-- visual-context-task:end -->` |

**Serialized form**:

```markdown
<!-- visual-context-task:start -->
- [ ] **T000** Load visual references from `spec.md`
  - hero.png: C:\Users\arthur.santos\designs\hero.png
  - icon.svg: https://cdn.example.com/icons/icon.svg
<!-- visual-context-task:end -->
```

The block is always followed by exactly one blank line before any pre-existing content in `tasks.md`.

**Identity / uniqueness**: Exactly one block, identified by the `start_marker`/`end_marker` literal pair, may exist in `tasks.md`. Any matching block is fully replaced on each hook run.

**Lifecycle**:
1. Created by the after_tasks hook when (a) `tasks.md` exists and (b) `spec.md` has a non-empty `## Visual References` section.
2. Replaced (delete-and-rewrite) on every subsequent after_tasks invocation, ensuring idempotency (FR-006).
3. Removed if a subsequent after_tasks run finds the Visual References section empty or missing (the hook deletes the block and writes nothing in its place — FR-008 ensures `tasks.md` for unaffected features stays unchanged).

## Entity 3: Hook Registration Entry

**Location on disk**: Two YAML mappings inside `.specify/extensions.yml` and the mirror declarations inside `.specify/extensions/visual-refs/extension.yml`.

**Fields** (per entry):

| Field | Type | Validation |
|---|---|---|
| `extension` | string | must equal `visual-refs` |
| `command` | string | `speckit.visual.extract-refs` for after_specify; `speckit.visual.prepend-task` for after_tasks |
| `enabled` | boolean | `true` |
| `optional` | boolean | `false` (mandatory; failure surfaces as warning per FR-011) |
| `prompt` | string | `null` (mandatory hooks do not prompt) |
| `description` | string | human-readable; e.g. `Extract PNG/SVG references from /speckit-specify input into spec.md` |
| `condition` | null | `null` (always run when the event fires) |

**Serialized form** (added to `.specify/extensions.yml`, **first entry** under each event):

```yaml
hooks:
  after_specify:
  - extension: visual-refs
    command: speckit.visual.extract-refs
    enabled: true
    optional: false
    prompt: null
    description: Extract PNG/SVG references from /speckit-specify input into spec.md
    condition: null
  - extension: git
    command: speckit.git.commit
    # …existing entry, unchanged…
  after_tasks:
  - extension: visual-refs
    command: speckit.visual.prepend-task
    enabled: true
    optional: false
    prompt: null
    description: Prepend a visual-context task to tasks.md based on spec.md Visual References
    condition: null
  - extension: git
    command: speckit.git.commit
    # …existing entry, unchanged…
```

**Identity / uniqueness**: Exactly one entry per event. The git entries underneath are not modified.

**Lifecycle**: Created during implementation as part of the YAML diff to `.specify/extensions.yml`. Never mutated by the hooks themselves. Mirrors live in `extensions/visual-refs/extension.yml` so a future `specify install` reproduces the aggregator state.

## State transitions

There are no lifecycle state machines. The flow is purely:

1. `/speckit-specify` writes `spec.md` → after_specify hook reads `**Input**:` line → optionally writes `## Visual References` section.
2. `/speckit-tasks` writes `tasks.md` → after_tasks hook reads `## Visual References` from `spec.md` → optionally rewrites the leading delimited block in `tasks.md`.
3. `/speckit-implement` reads `tasks.md` top-to-bottom, encountering the visual-context block first (if present) and acting on it.

No concurrent writers. No retries needed beyond surfacing the warning on failure.
