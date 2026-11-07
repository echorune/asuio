import { cp, mkdir } from 'node:fs/promises'

await mkdir('dist/src', { recursive: true })
await cp('index.html', 'dist/index.html')
await cp('guide.html', 'dist/guide.html')
await cp('src/styles.css', 'dist/src/styles.css')
