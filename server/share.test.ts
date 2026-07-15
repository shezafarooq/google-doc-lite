import { describe, expect, it } from 'vitest'
import { createDb, listDocuments } from './db.js'

describe('document sharing access', () => {
  it('shows a shared document in the recipient shared list, not their owned list', () => {
    const db = createDb(':memory:')
    const doc = db.prepare('INSERT INTO documents (title, content, owner_id) VALUES (?, ?, ?)').run('Strategy', '{}', 1)
    db.prepare('INSERT INTO shares (document_id, user_id) VALUES (?, ?)').run(doc.lastInsertRowid, 2)
    const ownerDocs = listDocuments(db, 1) as any[]
    const recipientDocs = listDocuments(db, 2) as any[]
    expect(ownerDocs).toMatchObject([{ title: 'Strategy', section: 'owned' }])
    expect(recipientDocs).toMatchObject([{ title: 'Strategy', section: 'shared' }])
    expect(recipientDocs.some(d => d.section === 'owned')).toBe(false)
  })
})
