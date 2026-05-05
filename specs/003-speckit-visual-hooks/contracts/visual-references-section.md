# Contract: `## Visual References` section in `spec.md`

This file is the binding contract for the **Visual References** section that the after_specify hook writes into `spec.md`. The hook MUST produce output that conforms to every rule below.

## Insertion point

The section MUST be inserted exactly once, immediately after the front-matter block (the four lines `**Feature Branch**:`, `**Created**:`, `**Status**:`, `**Input**:`) and BEFORE any pre-existing `## Clarifications` or `## User Scenarios & Testing` heading.

If a `## Visual References` section already exists (e.g., a re-run of the hook), the existing section MUST be removed (header + body up to the next `##` heading) and rewritten in place. No content outside the section may be touched.

## Heading

Exact text:

```markdown
## Visual References
```

A single blank line MUST follow the heading before the first bullet, and a single blank line MUST follow the last bullet before the next heading.

## Body

Each detected image is one bullet line, in the order it appeared in the `**Input**:` text after deduplication:

```markdown
- <name>: <link>
```

Where:

- `<name>` is the basename of `<link>` (POSIX/Windows-aware split on `/` and `\`). Original casing preserved.
- `<link>` is the wrap/punct-stripped payload (see research R3). Original casing preserved.

## Skip-write rule

If the input string contains zero PNG/SVG references after extraction, the section MUST NOT be written. The hook MUST leave `spec.md` byte-identical to its post-`/speckit-specify` state (this is what enables SC-005).

## Failure mode

If extraction throws (regex error, IO error, parse error on the `**Input**:` line), the hook MUST NOT mutate `spec.md`, MUST exit with a non-zero status, and MUST emit a one-line warning to stderr in the form:

```text
[specify] Warning: visual-refs after_specify failed: <reason>; spec.md preserved without Visual References section
```

The parent `/speckit-specify` command MUST still report SUCCESS (FR-011, clarification Q1).

## Detection regex (canonical)

The hook implementations MUST match references using the equivalent of this extended regex (case-insensitive on the extension):

```regex
(?i)(?:[A-Za-z]:\\|\\\\|/|\./|\.\./|https?://)?[^\s"'<>]+\.(png|svg)(\?[^\s"'<>]*)?
```

After matching, the hook MUST trim the following wrap/punct characters from each match: leading `"`, `'`, `<`, `(`; trailing `"`, `'`, `>`, `)`, `.`, `,`, `;`, `:`. The leading and trailing strip sets are intentionally symmetric for `(` / `)` so authors writing `(see hero.png)` are handled. Bare relative paths (no leading slash or scheme) are accepted and recorded as-is.

## Deduplication

The post-trim payload string is the unique key. Duplicates MUST be discarded preserving the first-seen position.

## Examples

**Input** (line in `spec.md`):

```text
**Input**: User description: "build the hero block; design at C:\designs\hero.png and the icon at <https://cdn.example.com/icons/icon.svg>. fallback hero.png ignored."
```

**Expected section**:

```markdown
## Visual References

- hero.png: C:\designs\hero.png
- icon.svg: https://cdn.example.com/icons/icon.svg

```

(Note: the second `hero.png` reference is dropped by deduplication.)

**Input** with no references:

```text
**Input**: User description: "add a privacy toggle to the cookie modal."
```

**Expected**: `spec.md` unchanged; no section written.
