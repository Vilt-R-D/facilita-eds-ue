---
name: cacophony-fetch-attachment
description: Download spec-kit attachments (PNG/SVG/etc) referenced inside a `<!-- cacophony:meta ... -->` block via the local cacophony middleware (http://localhost:8080). Direct fetch fails (401/403) because the URL points to Plane's authenticated REST API — only cacophony holds the X-API-Key. Auto-triggers when a cacophony:meta block is present, when a task references an image by name, or after any 401/403 on a Plane-domain URL.
compatibility: Requires cacophony middleware running locally on port 8080 (Spring Boot). Targets spec-kit projects with `<!-- cacophony:meta ... -->` blocks (currently emitted only for `tracker == "plane"`).
metadata:
  author: facilita-eds
  source: cacophony:api/attachments/fetch
user-invocable: false
disable-model-invocation: false
---

# Cacophony Attachment Fetcher

Reads/visualizes/processes the contents of an image whose URL appears inside a `<!-- cacophony:meta ... -->` block in a spec-kit file. The URL points to Plane's REST API and requires the `X-API-Key` header — direct fetch (`WebFetch`, unauthenticated `curl`, browser open) returns 401/403. The local `cacophony` middleware on `http://localhost:8080` holds the credential and proxies the fetch via `POST /api/attachments/fetch`.

## When to activate

Activate this skill proactively whenever:

- Processing a spec-kit file (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `tasks.md`, `contracts/*`, `checklists/*`) that contains a `<!-- cacophony:meta ... -->` block.
- A task in `tasks.md` or a requirement in `spec.md` references an image by name (e.g. "ver mockup.png", "implementar conforme wireframe.svg").
- You need to compare a visual design with code being implemented.
- Any earlier attempt to fetch a URL on the Plane domain failed with 401/403 — that signals missing auth and this skill is the correct path.

Do not try alternatives: `WebFetch`, unauthenticated `curl`, or opening the URL in a browser all fail. Only cacophony has the `X-API-Key`.

## Prerequisites

The cacophony middleware must be reachable at `http://localhost:8080`. If it isn't, report verbatim and stop:

```text
cacophony middleware not reachable at localhost:8080 — start it with .\mvnw.cmd spring-boot:run in the cacophony repo, then retry.
```

## Behavior

1. **Locate the metadata block.** Search the relevant spec-kit file (typically `<featuredir>/spec.md`; resolve `<featuredir>` from `.specify/feature.json`'s `feature_directory`, falling back to a branch-name lookup if missing). Match the literal regex (multiline):

   ```
   <!-- cacophony:meta\s*(?<json>\{[\s\S]*?\})\s*-->
   ```

   One block per file. If absent, the spec-kit had no attachments — report and proceed without.

2. **Parse the JSON payload.** Guaranteed shape:

   ```json
   {
     "tracker": "plane",
     "projectId": "uuid",
     "issueId": "uuid",
     "attachments": [
       {"id": "uuid", "name": "filename.ext", "url": "https://.../attachments/<id>/"}
     ]
   }
   ```

   If `tracker != "plane"`, this skill is out of scope — emit a warning and stop. Other trackers require updating the skill.

3. **Select the attachment.** Prefer matching by `name` (exact filename mentioned in the surrounding task/spec text). Fall back to ordinal selection (first PNG, first SVG, etc.) when the reference is loose ("the mockup"). Capture the chosen entry's `url`.

4. **Fetch via cacophony.** Single Bash tool invocation (POSIX form — Git-Bash on this Windows host resolves `/tmp`):

   ```bash
   curl -s -w "\n%{http_code}\n%{content_type}\n" \
     -X POST http://localhost:8080/api/attachments/fetch \
     -H "Content-Type: application/json" \
     -d '{"url":"<chosen-url>"}' \
     --output /tmp/<name>
   ```

   The trailing `\n%{http_code}\n%{content_type}\n` writes status + content-type to stdout after the body finishes streaming to `--output`. Capture both.

5. **Interpret the response.**

   | Status | Body / content-type | Action |
   |---|---|---|
   | 200 | binary with expected content-type (`image/png`, `image/svg+xml`, …) | file saved — proceed (Read `/tmp/<name>` for PNG/JPG; Read for SVG markup) |
   | 400 | `{"error":"url required"}` | `url` field empty — fix the request |
   | 404 | `{"error":"could not fetch attachment"}` | Plane error, attachment removed, or URL outside cacophony's configured Plane `baseUrl` (anti-SSRF) — report and continue without |
   | connection refused | — | cacophony not running — report per Prerequisites |

6. **Use the file.**
   - PNG/JPG: `Read /tmp/<name>` — Claude Code is multimodal and views the image.
   - SVG: `Read /tmp/<name>` returns the XML markup.
   - Other types: handle per content-type.

   Cache: re-use `/tmp/<name>` within the same session instead of re-fetching.

## Constraints

- Endpoint is local-only (`localhost:8080`). Do not expose remotely.
- The URL in the request body must match cacophony's configured Plane `baseUrl`; other URLs are rejected with 404 (anti-SSRF).
- No server-side cache — every call re-downloads from Plane. Cache locally under `/tmp` if reused.
- Never modify the `cacophony:meta` block — it is managed by cacophony.
- Only `tracker == "plane"` is supported today. Other trackers require updating this skill.

## Failure mode

On any non-200 response (or connection refused), leave no partial file at `/tmp/<name>`, emit one warning line, and continue without the attachment so the parent task is not blocked:

```text
[cacophony] Warning: <reason>; attachment <name> skipped
```

## End-to-end example

Task: "Implementar header conforme `header-mockup.png`."

1. Read `specs/<feature>/spec.md`, locate the `<!-- cacophony:meta ... -->` block.
2. Parse the JSON, find `attachments[].name == "header-mockup.png"`, capture its `url`.
3. `POST http://localhost:8080/api/attachments/fetch` with body `{"url":"<url>"}`, save to `/tmp/header-mockup.png`.
4. `Read /tmp/header-mockup.png` — Claude views the mockup.
5. Implement the header.
