import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

export type Db = Database.Database

export function createDb(filename = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'ajaia-docs.db')): Db {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true })
  const db = new Database(filename)
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      content TEXT NOT NULL, owner_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS shares (
      document_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (document_id, user_id),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  const seed = db.prepare('INSERT OR IGNORE INTO users (id, name, email, color) VALUES (?, ?, ?, ?)')
  seed.run(1, 'Maya Chen', 'maya@ajaia.dev', '#6c5ce7')
  seed.run(2, 'Theo Brooks', 'theo@ajaia.dev', '#e17055')
  seed.run(3, 'Nina Patel', 'nina@ajaia.dev', '#00a884')
  return db
}

export function documentAccess(db: Db, documentId: number, userId: number) {
  return db.prepare(`
    SELECT d.*, u.name owner_name,
      CASE WHEN d.owner_id = ? THEN 'owner' ELSE 'shared' END access
    FROM documents d JOIN users u ON u.id = d.owner_id
    LEFT JOIN shares s ON s.document_id = d.id AND s.user_id = ?
    WHERE d.id = ? AND (d.owner_id = ? OR s.user_id = ?)
  `).get(userId, userId, documentId, userId, userId) as any
}

export function listDocuments(db: Db, userId: number) {
  return db.prepare(`
    SELECT DISTINCT d.id, d.title, d.owner_id ownerId, u.name ownerName, d.created_at createdAt, d.updated_at updatedAt,
      CASE WHEN d.owner_id = ? THEN 'owned' ELSE 'shared' END section,
      substr(replace(replace(d.content, char(10), ' '), char(13), ''), 1, 120) preview
    FROM documents d JOIN users u ON u.id = d.owner_id
    LEFT JOIN shares s ON s.document_id = d.id
    WHERE d.owner_id = ? OR s.user_id = ?
    ORDER BY d.updated_at DESC, d.id DESC
  `).all(userId, userId, userId)
}
