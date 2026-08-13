const hostname =
  process.env.FREEPORT_HOSTNAME?.trim() || 'https://freeport-5sl.pages.dev'

export const brand = {
  name: 'Freeport',
  shortName: 'Freeport',
  tagline: "The internet's best free stuff, curated.",
  description: "The internet's best free stuff, curated.",
  hostname,
  repoUrl: 'https://github.com/bytepassperks/freeport',
  showRepoLinks: false,
  contact: {
    feedbackPath: '/feedback',
    feedbackEndpoint: '/api/feedback'
  },
  socialLinks: [
    { icon: 'github', link: 'https://github.com/bytepassperks/freeport' }
  ],
  themeColor: '#1fa9a0',
  assets: {
    logo: '/freeport-icon.png',
    favicon: '/freeport-favicon.ico',
    og: '/freeport-og.png',
    pwaIcon: '/freeport-pwa-512.png',
    icon: '/freeport-icon.png',
    monochromeIcon: '/freeport-icon-navy.png',
    appleTouchIcon: '/freeport-apple-touch.png',
    hero: '/freeport-harbour.png'
  },
  aliases: [
    'freemediaheckyeah',
    'FMHY',
    'fmhy.net',
    'fmhy',
    'r/FREEMEDIAHECKYEAH'
  ],
  contentRules: {
    dropPaths: ['posts/**', 'other/**'],
    protectedPaths: [
      'docs/index.md',
      'docs/login.md',
      'docs/register.md',
      'docs/newsletter.md',
      'docs/feedback.md'
    ],
    dropLinks: [
      'https://github.com/fmhy/',
      'https://www.reddit.com/r/FREEMEDIAHECKYEAH',
      'https://fmhy.net/',
      'https://rentry.co/FMHYB64',
      'https://rentry.org/ircfmhyguide',
      'https://rentry.org/opensteamtoolguidefmhy',
      'https://searx.fmhy.net/',
      'https://api.fmhy.net/',
      'https://fmhyapi.wispy.qzz.io/',
      'https://greasyfork.org/en/scripts/485772-fmhy-base64-auto-decoder',
      'https://github.com/fmhy/FMHY/wiki/FMHY-Discord',
      'https://ffmhy.pages.dev/',
      'https://www.raycast.com/akshit_mehta/fmhy-search',
      'https://github.com/iamshamit/fmhy-search-flow-launcher'
    ],
    discordInviteCodes: []
  }
} as const

export type BrandConfig = typeof brand
