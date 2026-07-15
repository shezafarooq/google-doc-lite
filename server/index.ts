import { createDb } from './db.js'
import { createApp } from './app.js'

const port = Number(process.env.PORT) || 3001
createApp(createDb()).listen(port, () => console.log(`Ajaia Docs running on http://localhost:${port}`))
