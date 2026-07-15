# Ajaia Docs

A focused collaborative document editor built for the Ajaia AI-Native Full Stack Developer take-home. It supports rich-text editing, durable saves, `.txt`/`.md` imports, mock user switching, and owner-controlled sharing.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on port `3001`. The SQLite database is created automatically at `data/ajaia-docs.db` and three demo users are seeded.

For a production-style run:

```bash
npm run build
npm start
```

Open `http://localhost:3001`.

## Reviewer flow

1. Select **Maya Chen** in the lower-left user switcher.
2. Create a document, format content, and wait for the **Saved** status.
3. Share it with Theo from the editor's Share button.
4. Return to the dashboard and switch to **Theo Brooks**.
5. The document appears under **Shared with me** and remains editable.
6. Use **Upload .txt or .md** to turn a file (up to 1 MB) into a document.

## Verification

```bash
npm test
npm run build
```

The automated test checks the central sharing rule: a shared document appears in the recipient's shared list, never their owned list.

## Deliberate limits

- Authentication is simulated with three seeded users.
- Sharing grants edit access; there are no granular roles.
- Imports support UTF-8 `.txt` and `.md` files up to 1 MB. Markdown is imported as readable text, not parsed formatting.
- No real-time co-editing, comments, or version history.

These cuts prioritize a reliable, demonstrable end-to-end product slice within the assignment timebox.
