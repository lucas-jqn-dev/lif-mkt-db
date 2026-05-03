export const CATEGORIES = ['Influencer', 'Publicidad', 'Eventos', 'RRSS', 'Otras']
export const STATES = ['EN IDEA', 'ACTIVA', 'PAUSADA', 'CANCELADA', 'REALIZADA']

export const CAT_COLORS = {
  Influencer: '#7C6EF0',
  Publicidad: '#F28D00',
  Eventos: '#19AD03',
  RRSS: '#38bdf8',
  Otras: '#FF8787',
}

export const EST_COLORS = {
  'EN IDEA': '#6B7280',
  ACTIVA: '#19AD03',
  PAUSADA: '#F28D00',
  CANCELADA: '#FF8787',
  REALIZADA: '#7C6EF0',
}

export function catLabel(cat) {
  if (cat === 'RRSS') return 'Ads RRSS'
  return cat || '-'
}

export function catClass(cat) {
  const map = {
    Influencer: 'cat-influencer',
    Publicidad: 'cat-publicidad',
    Eventos: 'cat-eventos',
    RRSS: 'cat-rrss',
    Otras: 'cat-otras',
  }
  return map[cat] || 'cat-otras'
}

export function estClass(estado) {
  const map = {
    'EN IDEA': 'est-en-idea',
    ACTIVA: 'est-activa',
    PAUSADA: 'est-pausada',
    CANCELADA: 'est-cancelada',
    REALIZADA: 'est-realizada',
  }
  return map[estado] || ''
}
