/* global console, process */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { brand } from '../brand.config.ts'

const upstreamRef = process.argv[2] ?? 'upstream/main'
const protectedPaths = new Set(brand.contentRules.protectedPaths)
const markdownGlobs = ['docs/*.md', 'docs/**/*.md']

const run = (args, options = {}) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: 'pipe',
    ...options
  }).trim()

const showFile = (ref, file) =>
  execFileSync('git', ['show', `${ref}:${file}`], { stdio: 'pipe' })

const existsInGit = (ref, file) => {
  try {
    run(['cat-file', '-e', `${ref}:${file}`])
    return true
  } catch {
    return false
  }
}

const isMarkdownPath = (file) =>
  file.startsWith('docs/') &&
  file.endsWith('.md') &&
  !file.startsWith('docs/.vitepress/')

const isProtected = (file) => protectedPaths.has(file)

const changedFiles = run([
  'diff',
  '--name-only',
  'HEAD',
  upstreamRef,
  '--',
  ...markdownGlobs
])
  .split('\n')
  .filter(Boolean)

const imported = []
const removed = []
for (const file of changedFiles) {
  if (!isMarkdownPath(file) || isProtected(file)) continue

  if (existsInGit(upstreamRef, file)) {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, showFile(upstreamRef, file))
    imported.push(file)
    continue
  }

  // Only remove a tracked Markdown file that existed in our previous tree.
  // Protected Freeport-owned pages are excluded above.
  if (existsInGit('HEAD', file) && existsSync(file)) {
    unlinkSync(file)
    removed.push(file)
  }
}

console.log(
  `[sync] imported ${imported.length} files, removed ${removed.length} upstream files`
)
if (imported.length) console.log(`[sync] imported: ${imported.join(', ')}`)
if (removed.length) console.log(`[sync] removed: ${removed.join(', ')}`)
