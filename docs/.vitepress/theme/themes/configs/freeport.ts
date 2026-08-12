import type { Theme } from '../types'

const light = {
  brand: { 1: '#147B78', 2: '#1FA9A0', 3: '#0B1F33', soft: '#B9E7E3' },
  bg: '#F7F9FB',
  bgAlt: '#EEF3F6',
  bgElv: '#FFFFFF',
  bgMark: '#DCE9EC',
  text: { 1: '#0B1F33', 2: '#40576A', 3: '#667C8D' },
  button: {
    brand: {
      bg: '#1FA9A0',
      border: '#1FA9A0',
      text: '#FFFFFF',
      hoverBorder: '#147B78',
      hoverText: '#FFFFFF',
      hoverBg: '#147B78',
      activeBorder: '#147B78',
      activeText: '#FFFFFF',
      activeBg: '#147B78'
    },
    alt: {
      bg: '#0B1F33',
      text: '#FFFFFF',
      hoverBg: '#123452',
      hoverText: '#FFFFFF'
    }
  },
  customBlock: {
    info: {
      bg: '#E8F4F5',
      border: '#1FA9A0',
      text: '#0B1F33',
      textDeep: '#0B1F33'
    },
    tip: {
      bg: '#E5F5EF',
      border: '#147B78',
      text: '#0B493F',
      textDeep: '#0B493F'
    },
    warning: {
      bg: '#FFF6DF',
      border: '#B17A12',
      text: '#654807',
      textDeep: '#654807'
    },
    danger: {
      bg: '#FCE9E8',
      border: '#B54848',
      text: '#6D2525',
      textDeep: '#6D2525'
    }
  },
  selection: { bg: '#B9E7E3' },
  home: {
    heroNameColor: '#0B1F33',
    heroNameBackground: 'none',
    heroImageBackground: 'none',
    heroImageFilter: 'none'
  }
}

const dark = {
  brand: { 1: '#63C9C0', 2: '#1FA9A0', 3: '#147B78', soft: '#164B59' },
  bg: '#081827',
  bgAlt: '#0B1F33',
  bgElv: '#102B43',
  bgMark: '#173B50',
  text: { 1: '#F7F9FB', 2: '#C6D5DF', 3: '#94AABD' },
  button: {
    brand: {
      bg: '#1FA9A0',
      border: '#63C9C0',
      text: '#062426',
      hoverBorder: '#63C9C0',
      hoverText: '#062426',
      hoverBg: '#63C9C0',
      activeBorder: '#63C9C0',
      activeText: '#062426',
      activeBg: '#63C9C0'
    },
    alt: {
      bg: '#173B50',
      text: '#F7F9FB',
      hoverBg: '#23546A',
      hoverText: '#FFFFFF'
    }
  },
  customBlock: {
    info: {
      bg: '#0D3040',
      border: '#1FA9A0',
      text: '#D6F3F0',
      textDeep: '#F7F9FB'
    },
    tip: {
      bg: '#0A392F',
      border: '#1FA9A0',
      text: '#C6EEE8',
      textDeep: '#F7F9FB'
    },
    warning: {
      bg: '#3C2C0F',
      border: '#F2C879',
      text: '#FBE8B5',
      textDeep: '#FFF1C9'
    },
    danger: {
      bg: '#401C25',
      border: '#E27C7C',
      text: '#FFD5D5',
      textDeep: '#FFF0F0'
    }
  },
  selection: { bg: '#176C71' },
  home: {
    heroNameColor: '#F7F9FB',
    heroNameBackground: 'none',
    heroImageBackground: 'none',
    heroImageFilter: 'none'
  }
}

export const freeportTheme: Theme = {
  name: 'freeport',
  displayName: 'Freeport',
  preview: '#1FA9A0',
  modes: { light, dark },
  fonts: {
    body: "'Freeport Sans', Inter, system-ui, sans-serif",
    heading: "'Freeport Sans', Inter, system-ui, sans-serif"
  },
  borderRadius: '0.75rem',
  customProperties: {
    '--vp-c-divider': 'rgba(11, 31, 51, 0.14)',
    '--vp-c-divider-light': 'rgba(11, 31, 51, 0.08)',
    '--vp-c-default-soft': 'rgba(31, 169, 160, 0.12)',
    '--vp-home-hero-image-background-image': 'none',
    '--vp-home-hero-image-filter': 'none'
  }
}
