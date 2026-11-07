import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const preview = process.argv.includes('--preview')
const root = preview ? 'dist' : '.'
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.ts': 'text/plain; charset=utf-8' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
    const safePath = normalize(pathname).replace(/^([/\\]|\.\.(?:[/\\]|$))+/, '')
    let file = join(root, safePath || 'index.html')
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html') } catch { file = join(root, 'index.html') }
    const data = await readFile(file)
    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
    response.end(data)
  } catch { response.writeHead(404); response.end('Not found') }
})
server.listen(5173, '127.0.0.1', () => console.log(`Canopy ${preview ? 'preview' : 'dev'} server: http://127.0.0.1:5173`))
