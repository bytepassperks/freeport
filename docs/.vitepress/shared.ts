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

import type { DefaultTheme } from 'vitepress'
import { brand } from '../../brand.config'

// @unocss-include

export const meta = {
  name: brand.name,
  description: brand.description,
  hostname: brand.hostname,
  keywords: ['stream', 'movies', 'gaming', 'reading', 'anime'],
  build: {
    api: true,
    nsfw: true
  }
}

export const excluded = [
  'readme.md',
  'single-page',
  'single-page.md',
  'feedback.md',
  'index.md',
  'sandbox.md',
  'startpage.md',
  'posts/**',
  'other/**'
]

// Strip the URL scheme and a leading "www." so "https://www.pi-hole.net/x" and
// "pi-hole.net/x" compare the same way. Shared by the build-time index
// (constants.ts) and the client search box so they normalize identically.
export const stripSchemeAndWww = (value: string) =>
  value.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/^www\./, '')

const TRACKING_QUERY_PARAMS = new Set([
  'fbclid',
  'gclid',
  'gbraid',
  'mc_cid',
  'mc_eid',
  'wbraid'
])

export function normalizeSearchUrl(value: string) {
  const stripped = stripSchemeAndWww(value)
  const hashIndex = stripped.indexOf('#')
  const withoutHash = hashIndex === -1 ? stripped : stripped.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : stripped.slice(hashIndex + 1)
  const queryIndex = withoutHash.indexOf('?')

  if (queryIndex === -1) return hash ? `${withoutHash}#${hash}` : withoutHash

  const hostPath = withoutHash.slice(0, queryIndex)
  const params = new URLSearchParams(withoutHash.slice(queryIndex + 1))
  for (const key of [...params.keys()]) {
    if (key.startsWith('utm_') || TRACKING_QUERY_PARAMS.has(key)) {
      params.delete(key)
    }
  }

  const query = params.toString()
  return `${hostPath}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}

const safeEnv = (key: string) =>
  typeof process !== 'undefined' ? process.env?.[key] : undefined

// Treat the common falsy spellings as "off", not just the exact string 'false'.
const isFalsy = (val?: string) =>
  ['false', '0', 'no', 'off'].includes((val ?? '').trim().toLowerCase())

if (isFalsy(safeEnv('FREEPORT_BUILD_NSFW'))) {
  meta.build.nsfw = false
}
if (isFalsy(safeEnv('FREEPORT_BUILD_API'))) {
  meta.build.api = false
}

const formatCommitRef = (commitRef: string) =>
  `<a href="${brand.repoUrl}/commit/${commitRef}">${commitRef.slice(0, 8)}</a>`

const cfStart = safeEnv('CF_PAGES_COMMIT_SHA')
const commitStart = safeEnv('COMMIT_REF')

export const commitRef =
  brand.showRepoLinks && safeEnv('CF_PAGES') && cfStart
    ? formatCommitRef(cfStart)
    : brand.showRepoLinks && commitStart
      ? formatCommitRef(commitStart)
      : 'dev'

export const feedback = `<a href="${brand.contact.feedbackPath}" class="feedback-footer">Made with ❤</a>`

export const socialLinks: DefaultTheme.SocialLink[] = brand.showRepoLinks
  ? brand.socialLinks
  : []

export const nav: DefaultTheme.NavItem[] = [
  {
    text: '<span class="i-lucide:compass"></span> Explore',
    items: [
      {
        text: '<span class="i-lucide:search"></span> Search',
        link: '/?search'
      },
      {
        text: '<span class="i-lucide:message-circle"></span> Feedback',
        link: '/feedback'
      },
      {
        text: '<span class="i-lucide:mail"></span> Newsletter',
        link: '/newsletter'
      },
      {
        text: '<span class="i-lucide:user-round-plus"></span> Create account',
        link: '/register'
      }
    ]
  }
]

export const sidebar: DefaultTheme.Sidebar | DefaultTheme.NavItemWithLink[] = [
  {
    text: '<span class="i-twemoji:books"></span> Beginners Guide',
    link: '/beginners-guide'
  },
  {
    text: '<span class="i-twemoji:newspaper"></span> Getting Started',
    link: '/beginners-guide'
  },
  {
    text: 'Browse',
    collapsed: false,
    items: [
      {
        text: '<span class="i-twemoji:name-badge"></span> Adblocking / Privacy',
        link: '/privacy'
      },
      {
        text: '<span class="i-twemoji:robot"></span> Artificial Intelligence',
        link: '/ai'
      },
      {
        text: '<span class="i-twemoji:television"></span> Movies / TV / Anime',
        link: '/video'
      },
      {
        text: '<span class="i-twemoji:musical-note"></span> Music / Podcasts / Radio',
        link: '/audio'
      },
      {
        text: '<span class="i-twemoji:video-game"></span> Gaming / Emulation',
        link: '/gaming'
      },
      {
        text: '<span class="i-twemoji:green-book"></span> Books / Comics / Manga',
        link: '/reading'
      },
      {
        text: '<span class="i-twemoji:floppy-disk"></span> Downloading',
        link: '/downloading'
      },
      {
        text: '<span class="i-twemoji:cyclone"></span> Torrenting',
        link: '/torrenting'
      },
      {
        text: '<span class="i-twemoji:brain"></span> Educational',
        link: '/educational'
      },
      {
        text: '<span class="i-twemoji:mobile-phone"></span> Android / iOS',
        link: '/mobile'
      },
      {
        text: '<span class="i-twemoji:penguin"></span> Linux / macOS',
        link: '/linux-macos'
      },
      {
        text: '<span class="i-twemoji:globe-showing-asia-australia"></span> Non-English',
        link: '/non-english'
      },
      {
        text: '<span class="i-twemoji:file-folder"></span> Miscellaneous',
        link: '/misc'
      }
    ]
  },
  {
    text: 'Tools',
    collapsed: false,
    items: [
      {
        text: '<span class="i-twemoji:laptop"></span> System Tools',
        link: '/system-tools'
      },
      {
        text: '<span class="i-twemoji:card-file-box"></span> File Tools',
        link: '/file-tools'
      },
      {
        text: '<span class="i-twemoji:paperclip"></span> Internet Tools',
        link: '/internet-tools'
      },
      {
        text: '<span class="i-twemoji:busts-in-silhouette"></span> Social Media Tools',
        link: '/social-media-tools'
      },
      {
        text: '<span class="i-twemoji:memo"></span> Text Tools',
        link: '/text-tools'
      },
      {
        text: '<span class="i-twemoji:video-game"></span> Gaming Tools',
        link: '/gaming-tools'
      },
      {
        text: '<span class="i-twemoji:framed-picture"></span> Image Tools',
        link: '/image-tools'
      },
      {
        text: '<span class="i-twemoji:film-frames"></span> Video Tools',
        link: '/video-tools'
      },
      {
        text: '<span class="i-twemoji:musical-notes"></span> Audio Tools',
        link: '/audio#audio-tools'
      },
      {
        text: '<span class="i-twemoji:mortar-board"></span> Educational Tools',
        link: '/educational#educational-tools'
      },
      {
        text: '<span class="i-twemoji:man-technologist"></span> Developer Tools',
        link: '/developer-tools'
      }
    ]
  },
  {
    text: 'More',
    collapsed: true,
    items: [
      meta.build.nsfw
        ? {
            text: '<span class="i-twemoji:no-one-under-eighteen"></span> NSFW',
            link: 'https://rentry.org/NSFW-Checkpoint'
          }
        : {},
      {
        text: '<span class="i-twemoji:warning"></span> Unsafe Sites',
        link: '/unsafe'
      },
      {
        text: '<span class="i-twemoji:back-arrow"></span> Recently Removed',
        link: '/recently-removed'
      },
      {
        text: '<span class="i-twemoji:package"></span> Storage',
        link: '/storage'
      },
      {
        text: '<span class="i-twemoji:incoming-envelope"></span> Newsletter',
        link: '/newsletter'
      },
      {
        text: '<span class="i-twemoji:locked"></span> Log In',
        link: '/login'
      }
    ]
  }
]
