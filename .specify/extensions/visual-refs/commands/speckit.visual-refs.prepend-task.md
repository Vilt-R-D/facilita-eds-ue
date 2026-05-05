---
description: "Prepend a visual-context task to tasks.md based on spec.md **Input** line"
---

# Prepend Visual-Context Task

This command is invoked as the `after_tasks` hook by the speckit host. It reads the active feature's `spec.md` `**Input**:` line, extracts every PNG/SVG reference (path or http(s) URL), and rewrites the leading delimited block of `tasks.md` so `/speckit-implement` loads each image into context before any feature task runs. Idempotent: re-running `/speckit-tasks` replaces the block in place. Surfaces any non-fatal warning back to the user without aborting the parent `/speckit-tasks` command.

## Behavior

1. Resolve the active feature directory:
   - First, read `.specify/feature.json` and use the `feature_directory` field if present and parseable.
   - If `feature.json` is missing or unparseable, fall back to the branch-prefix lookup implemented in `.specify/scripts/bash/common.sh::find_feature_dir_by_prefix` (or its PowerShell equivalent).
2. Pick the script implementation based on `.specify/init-options.json` `"script"` field (`"sh"` → bash, `"ps"` → powershell). Default to bash if the field is absent or unrecognized.
3. Invoke the chosen script with the absolute path to the feature directory.
4. If the script exits non-zero, capture the warning line from stderr and re-emit it as a non-fatal notice to the user. **Do NOT abort the parent command.** The parent `/speckit-tasks` MUST still report SUCCESS for its own write.

## Execution

- **Bash**: `bash .specify/extensions/visual-refs/scripts/bash/prepend-task.sh <absolute-feature-dir>`
- **PowerShell**: `powershell.exe -ExecutionPolicy Bypass -File .specify/extensions/visual-refs/scripts/powershell/prepend-task.ps1 -FeatureDir <absolute-feature-dir>` (the `-ExecutionPolicy Bypass` flag is required on default Windows installs where script execution is restricted)

## Output contract

On success, `tasks.md` begins with the idempotent `<!-- visual-context-task:start --> … <!-- visual-context-task:end -->` block listing every PNG/SVG reference parsed from spec.md's `**Input**:` line. Re-running the hook with unchanged inputs yields byte-identical output. See `specs/003-speckit-visual-hooks/contracts/visual-context-task.md` for the binding format.

## Failure mode

The script preserves `tasks.md` byte-identical (no partial mutation) and emits a single warning line of the form:

```text
[specify] Warning: visual-refs after_tasks failed: <reason>; tasks.md preserved
```

This warning is forwarded to the user as a non-fatal notice. `/speckit-tasks` continues to report SUCCESS.
