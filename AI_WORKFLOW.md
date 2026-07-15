# AI workflow note

I used OpenAI Codex as an implementation partner for repository scaffolding, Tiptap integration, API construction, visual styling, test setup, and documentation drafting. AI materially accelerated repetitive wiring across React, Express, SQLite, and TypeScript, leaving more time for product flow and presentation.

I kept the judgment calls human-directed: I selected a single deployable service, mocked identity, `.txt`/`.md` import, binary edit access, and a restrained document-focused visual system. I rejected expanding into real authentication, DOCX conversion, real-time presence, and granular permissions because each would weaken the reliable core within the timebox. I also avoided relying on client-only access checks; authorization is enforced on every relevant API route.

I verified the output by reading the generated access queries and mutation rules, exercising the production TypeScript build, and running an automated SQLite sharing test. I also reviewed the UI at desktop and responsive breakpoints and included explicit loading, empty, saving, validation, and error states.
