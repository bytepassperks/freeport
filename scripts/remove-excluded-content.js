import { rm } from 'node:fs/promises'

await Promise.all(
  ['posts', 'other', 'single-page.md'].map((path) =>
    rm(`docs/.vitepress/dist/${path}`, { recursive: true, force: true })
  )
)
