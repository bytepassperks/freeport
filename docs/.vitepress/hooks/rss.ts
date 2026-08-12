/**
 *  Copyright (c) 2025 taskylizard. Apache License 2.0.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import type { SiteConfig } from 'vitepress'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import { Feed } from 'feed'
import { brand } from '../../../brand.config'
import { meta } from '../constants'

export async function generateFeed(config: SiteConfig): Promise<void> {
  const feed: Feed = new Feed({
    id: meta.hostname,
    link: meta.hostname,
    title: `${brand.name} updates`,
    description: meta.description,
    language: 'en-US',
    image: `${brand.hostname}${brand.assets.og}`,
    favicon: `${meta.hostname}/favicon.ico`,
    copyright: `Copyright (c) ${new Date().getFullYear()} ${brand.name}`
  })

  writeFileSync(path.join(config.outDir, 'feed.rss'), feed.rss2())
  return consola.info('Generated rss feed.')
}
