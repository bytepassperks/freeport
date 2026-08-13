import { brand } from '../../../brand.config'

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const aliasPattern = new RegExp(
  `(?<![\\w-])(?:${[...brand.aliases]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|')})(?![\\w-])`,
  'gi'
)

const discordInviteCodes = new Set(
  brand.contentRules.discordInviteCodes.map((code) => code.toLowerCase())
)

const OWN_LINK_RE = /\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi

const markdownLinkCount = (text: string) =>
  (text.match(/\[[^\]]+]\(https?:\/\/[^)\s]+\)/gi) ?? []).length

const listItemCount = (text: string) =>
  (text.match(/^\s*[*+-]\s+/gm) ?? []).length

export interface BrandingStats {
  file: string
  linksIn: number
  linksOut: number
  listItemsIn: number
  listItemsOut: number
  droppedLines: string[]
}

export const brandingStats: BrandingStats[] = []

function isOwnedUrl(value: string) {
  const normalized = value
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .toLowerCase()
  return (
    normalized.startsWith('github.com/fmhy/') ||
    normalized.startsWith('reddit.com/r/freemediaheckyeah') ||
    normalized.startsWith('fmhy.net/') ||
    normalized.startsWith('searx.fmhy.net/') ||
    normalized.startsWith('api.fmhy.net/') ||
    normalized.startsWith('fmhyapi.wispy.qzz.io/') ||
    normalized.startsWith('rentry.co/fmhyb64') ||
    normalized.startsWith('rentry.org/ircfmhyguide') ||
    normalized.startsWith('rentry.org/opensteamtoolguidefmhy') ||
    normalized === 'ffmhy.pages.dev' ||
    normalized.startsWith('ffmhy.pages.dev/') ||
    (normalized.startsWith('raycast.com/') &&
      normalized.includes('fmhy-search')) ||
    (normalized.startsWith('github.com/iamshamit/') &&
      normalized.includes('fmhy-search')) ||
    (normalized.startsWith('greasyfork.org/') && normalized.includes('fmhy')) ||
    ((normalized.startsWith('discord.gg/') ||
      normalized.startsWith('discord.com/invite/')) &&
      discordInviteCodes.has(normalized.split('/').pop() ?? ''))
  )
}

function isOwnedEntryUrl(value: string) {
  const normalized = value
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .toLowerCase()
  return (
    normalized.startsWith('github.com/fmhy/') ||
    normalized.startsWith('reddit.com/r/freemediaheckyeah') ||
    normalized.startsWith('fmhy.net/') ||
    normalized === 'ffmhy.pages.dev' ||
    normalized.startsWith('ffmhy.pages.dev/') ||
    (normalized.startsWith('raycast.com/') &&
      normalized.includes('fmhy-search')) ||
    (normalized.startsWith('github.com/iamshamit/') &&
      normalized.includes('fmhy-search')) ||
    ((normalized.startsWith('discord.gg/') ||
      normalized.startsWith('discord.com/invite/')) &&
      discordInviteCodes.has(normalized.split('/').pop() ?? '')) ||
    (normalized.startsWith('greasyfork.org/') && normalized.includes('fmhy'))
  )
}

function firstLinkIsOwned(line: string) {
  const first = line.match(/\[[^\]]*]\((https?:\/\/[^)\s>]+)/i)
  const firstTarget = first?.index ?? line.length
  const precedingTarget = line.match(/(?:<|https?:\/\/)[^>\s]+/i)
  if (
    precedingTarget?.index !== undefined &&
    precedingTarget.index < firstTarget
  ) {
    return isOwnedEntryUrl(precedingTarget[0])
  }
  return first ? isOwnedEntryUrl(first[1]) : false
}

function replaceAlias(value: string) {
  return value.replace(
    aliasPattern,
    (match, offset: number, source: string) => {
      const lineStart = source.lastIndexOf('\n', offset) + 1
      const lineEnd = source.indexOf('\n', offset)
      const line = source.slice(
        lineStart,
        lineEnd === -1 ? source.length : lineEnd
      )
      const surroundingText = line
        .replace(match, '')
        .replace(/[`*_#[\]()>:]/g, '')
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/[^a-zA-Z]+/g, '')
      const isAllCapsHeading =
        /^\s*#{1,6}\s/.test(line) &&
        (surroundingText.length === 0 ||
          surroundingText === surroundingText.toUpperCase())
      if (
        isAllCapsHeading ||
        (surroundingText.length > 0 &&
          surroundingText === surroundingText.toUpperCase())
      ) {
        return brand.name.toUpperCase()
      }
      if (match === match.toLowerCase()) return brand.name.toLowerCase()
      return brand.name
    }
  )
}

export function rewriteBranding(
  text: string,
  file = '<unknown>',
  trackStats = true
) {
  const droppedLines: string[] = []
  const dropped = text
    .split('\n')
    .filter((line) => {
      const lower = line.toLowerCase()
      const isSelfCta =
        lower.includes('fmhy safeguard') || lower.includes('back to wiki index')
      const shouldDrop =
        /^\s*[*+-]\s/.test(line) && (firstLinkIsOwned(line) || isSelfCta)
      if (shouldDrop) droppedLines.push(line)
      return !shouldDrop
    })
    .join('\n')

  const protectedParts: string[] = []
  const protect = (part: string) => {
    const token = `__FREEPORT_PROTECTED_${protectedParts.length}__`
    protectedParts.push(part)
    return token
  }

  let output = dropped
    .replace(/(`{3,}|~{3,})[\s\S]*?\1/g, protect)
    .replace(/`[^`\n]+`/g, protect)
    .replace(OWN_LINK_RE, (match, url: string) => {
      if (!isOwnedUrl(url)) return match
      const label = match.match(/^\[([^\]]*)\]/)?.[1] ?? ''
      return label ? replaceAlias(label) : ''
    })

  output = output.replace(/https?:\/\/[^\s<>)]+/gi, (url) =>
    isOwnedUrl(url) ? brand.hostname : protect(url)
  )
  output = replaceAlias(output)

  const result = output.replace(/__FREEPORT_PROTECTED_(\d+)__/g, (_, index) => {
    const part = protectedParts[Number(index)]
    return part ?? ''
  })
  if (trackStats) {
    brandingStats.push({
      file,
      linksIn: markdownLinkCount(text),
      linksOut: markdownLinkCount(result),
      listItemsIn: listItemCount(text),
      listItemsOut: listItemCount(result),
      droppedLines
    })
  }
  return result
}
