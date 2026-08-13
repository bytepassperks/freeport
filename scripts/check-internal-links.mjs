import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'docs/.vitepress/dist')
const files = []
const htmlFiles = []

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) await collect(file)
    else {
      files.push(file)
      if (entry.name.endsWith('.html')) htmlFiles.push(file)
    }
  }
}

function routeCandidates(pathname) {
  const path = pathname.replace(/^\/+|\/+$/g, '')
  if (!path) return ['index.html']
  return [`${path}.html`, `${path}/index.html`]
}

await collect(root)
const available = new Set(
  files.flatMap((file) => {
    const rel = relative(root, file).replaceAll('\\', '/')
    return [rel, ...routeCandidates(`/${rel.replace(/\.html$/, '')}`)]
  })
)
const missing = new Map()

for (const file of htmlFiles) {
  const text = await readFile(file, 'utf8')
  for (const match of text.matchAll(/href=["'](\/[^"'#?]*)[^"']*["']/g)) {
    const pathname = match[1]
    if (pathname.startsWith('/assets/')) continue
    const candidates = routeCandidates(pathname)
    if (candidates.some((candidate) => available.has(candidate))) continue
    const rel = relative(process.cwd(), file).replaceAll('\\', '/')
    missing.set(`${rel}:${pathname}`, true)
  }
}

if (missing.size) {
  console.error('Dead internal links found in generated HTML:')
  for (const link of missing.keys()) console.error(link)
  process.exit(1)
}

console.log(
  `Internal link check passed: ${htmlFiles.length} generated HTML files scanned.`
)
