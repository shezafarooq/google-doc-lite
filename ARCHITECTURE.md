# Architecture note

## Shape

Ajaia Docs is a single repository and deployable service. React and Tiptap provide the browser UI and structured rich-text model. Express owns a small REST API. SQLite persists users, Tiptap JSON, document ownership, and unique document/user share pairs. In production, Express serves the Vite build as well as the API.

## Data and access

- `users` contains the three seeded personas used by the mock identity switcher.
- `documents` contains title, serialized Tiptap JSON, timestamps, and a required owner.
- `shares` is a many-to-many access table with a composite primary key to prevent duplicates.

Every read and write resolves access server-side through ownership or a share record. Sharing, revoking, and deletion require ownership. The client distinction between “Owned” and “Shared” is therefore presentation of a backend rule, not the rule itself.

## Priorities and tradeoffs

The product spine—create, edit, autosave, reopen—received the most attention. Sharing and imports were built around that spine rather than as disconnected demos. Autosave is debounced to keep typing responsive and limit database writes, while blur/back navigation trigger an immediate save.

I chose a mock identity switcher because real authentication would add setup and review friction without demonstrating the requested sharing model more clearly. SQLite keeps persistence zero-configuration. Tiptap avoids fragile browser editing behavior while preserving semantic JSON.

With another 2–4 hours I would add Markdown-aware import, API integration tests for unauthorized mutation, optimistic conflict detection using `updated_at`, and deployment telemetry. Real-time co-editing would remain a separate product phase because it changes the persistence and conflict model substantially.
