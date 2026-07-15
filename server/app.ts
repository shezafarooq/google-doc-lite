import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import type { Db } from './db.js'
import { documentAccess, listDocuments } from './db.js'

const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] }
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } })

function plainTextDoc(text: string) {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean).map(block => ({
    type: 'paragraph', content: block ? [{ type: 'text', text: block.replace(/\n/g, ' ') }] : undefined,
  }))
  return { type: 'doc', content: paragraphs.length ? paragraphs : [{ type: 'paragraph' }] }
}

export function createApp(db: Db) {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => res.json({ ok: true }))
  app.get('/api/users', (_req, res) => res.json(db.prepare('SELECT * FROM users ORDER BY id').all()))

  app.get('/api/documents', (req, res) => {
    const userId = Number(req.query.userId)
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    res.json(listDocuments(db, userId))
  })

  app.post('/api/documents', (req, res) => {
    const { ownerId, title = 'Untitled document' } = req.body
    if (!Number(ownerId)) return res.status(400).json({ error: 'ownerId is required' })
    const result = db.prepare('INSERT INTO documents (title, content, owner_id) VALUES (?, ?, ?)')
      .run(String(title).trim() || 'Untitled document', JSON.stringify(emptyDoc), Number(ownerId))
    res.status(201).json({ id: Number(result.lastInsertRowid) })
  })

  app.get('/api/documents/:id', (req, res) => {
    const doc = documentAccess(db, Number(req.params.id), Number(req.query.userId))
    if (!doc) return res.status(404).json({ error: 'Document not found or access denied' })
    const sharedWith = db.prepare('SELECT u.id, u.name, u.email, u.color FROM shares s JOIN users u ON u.id=s.user_id WHERE s.document_id=?').all(doc.id)
    res.json({ id: doc.id, title: doc.title, content: JSON.parse(doc.content), ownerId: doc.owner_id, ownerName: doc.owner_name, access: doc.access, updatedAt: doc.updated_at, sharedWith })
  })

  app.put('/api/documents/:id', (req, res) => {
    const id = Number(req.params.id), userId = Number(req.body.userId)
    const doc = documentAccess(db, id, userId)
    if (!doc) return res.status(404).json({ error: 'Document not found or access denied' })
    const title = String(req.body.title || '').trim()
    if (!title) return res.status(400).json({ error: 'A title is required' })
    if (!req.body.content || req.body.content.type !== 'doc') return res.status(400).json({ error: 'Invalid document content' })
    db.prepare("UPDATE documents SET title=?, content=?, updated_at=datetime('now') WHERE id=?")
      .run(title, JSON.stringify(req.body.content), id)
    res.json({ ok: true, updatedAt: new Date().toISOString() })
  })

  app.delete('/api/documents/:id', (req, res) => {
    const result = db.prepare('DELETE FROM documents WHERE id=? AND owner_id=?').run(Number(req.params.id), Number(req.query.userId))
    if (!result.changes) return res.status(403).json({ error: 'Only the owner can delete this document' })
    res.status(204).end()
  })

  app.post('/api/documents/:id/share', (req, res) => {
    const id = Number(req.params.id), ownerId = Number(req.body.ownerId), userId = Number(req.body.userId)
    const doc = db.prepare('SELECT * FROM documents WHERE id=? AND owner_id=?').get(id, ownerId) as any
    if (!doc) return res.status(403).json({ error: 'Only the owner can share this document' })
    if (userId === ownerId) return res.status(400).json({ error: 'The owner already has access' })
    const user = db.prepare('SELECT id FROM users WHERE id=?').get(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    db.prepare('INSERT OR IGNORE INTO shares (document_id, user_id) VALUES (?, ?)').run(id, userId)
    res.status(201).json({ ok: true })
  })

  app.delete('/api/documents/:id/share/:userId', (req, res) => {
    const doc = db.prepare('SELECT owner_id FROM documents WHERE id=?').get(Number(req.params.id)) as any
    if (!doc || doc.owner_id !== Number(req.query.ownerId)) return res.status(403).json({ error: 'Only the owner can change access' })
    db.prepare('DELETE FROM shares WHERE document_id=? AND user_id=?').run(Number(req.params.id), Number(req.params.userId))
    res.status(204).end()
  })

  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Choose a file to import' })
    if (!/\.(txt|md)$/i.test(req.file.originalname)) return res.status(400).json({ error: 'Only .txt and .md files are supported' })
    const ownerId = Number(req.body.ownerId)
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' })
    const title = path.basename(req.file.originalname, path.extname(req.file.originalname)) || 'Imported document'
    const result = db.prepare('INSERT INTO documents (title, content, owner_id) VALUES (?, ?, ?)')
      .run(title, JSON.stringify(plainTextDoc(req.file.buffer.toString('utf8'))), ownerId)
    res.status(201).json({ id: Number(result.lastInsertRowid) })
  })

  const dist = path.join(process.cwd(), 'dist')
  if (fs.existsSync(dist)) {
    app.use(express.static(dist))
    app.get('{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
  }
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err?.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({ error: err?.code === 'LIMIT_FILE_SIZE' ? 'File must be smaller than 1 MB' : 'Something went wrong' })
  })
  return app
}
