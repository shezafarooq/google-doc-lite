# Submission contents

- Full source code for the React/TypeScript, Express, and SQLite application
- `README.md` — setup, reviewer flow, verification, and scope limits
- `ARCHITECTURE.md` — system design, priorities, and next steps
- `AI_WORKFLOW.md` — AI usage and verification note
- `walkthrough-url.txt` — walkthrough placeholder to replace after recording
- Automated sharing test at `server/share.test.ts`

## Links to complete before submission

- Live product URL: https://google-doc-lite.onrender.com/
- Walkthrough video: _add public Loom/YouTube URL_

## Status

Core flows are implemented: create, rename, rich-text edit, autosave/reopen, delete, `.txt`/`.md` import, user switching, owner/shared organization, sharing, and revocation. Authentication, DOCX import, real-time collaboration, comments, and version history are intentionally out of scope.

The demo currently uses SQLite on Render's free web tier. Data persists across browser refreshes during an active instance, but the demo database can reset when the free service sleeps, restarts, or redeploys. This is a hosting-tier limitation; a persistent disk or managed database is the production path.
