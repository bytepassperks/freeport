import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.argv[2] ?? 'docs/.vitepress/dist'
const extensions = new Set(['.html', '.xml', '.rss', '.json', '.txt'])
const files = []

async function collectFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      await collectFiles(path)
    } else if (extensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      files.push(path)
    }
  }
}

await collectFiles(root)
const pattern = /fmhy|freemediaheckyeah|fmhy-leads/i
const leaks = []

for (const file of files) {
  const text = await readFile(file, 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      leaks.push(`${file}:${index + 1}: ${line.trim().slice(0, 240)}`)
    }
  })
}

if (leaks.length) {
  console.error(
    `User-visible branding or internal database references remain in ${root}:`
  )
  leaks.slice(0, 20).forEach((leak) => console.error(leak))
  if (leaks.length > 20) console.error(`...and ${leaks.length - 20} more`)
  process.exit(1)
}

console.log(
  `Branding leak check passed: ${files.length} generated files scanned.`
)
