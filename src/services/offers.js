// Offers service (localStorage)
// - Keeps job offers in one place so we can later run AI match (CV vs offer)
// - Also stores an "active" offer (selected by the user)

const OFFERS_KEY = 'wingman_offers_v1'
const ACTIVE_OFFER_KEY = 'wingman_active_offer_id_v1'

const safeJsonParse = (value, fallback) => {
  try {
    const v = JSON.parse(value)
    return v ?? fallback
  } catch {
    return fallback
  }
}

const nowIso = () => new Date().toISOString()

const makeId = () => {
  // Browser-safe id generator
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `off_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const normalizeOffer = offer => {
  const o = offer || {}
  const title = (o.title || '').trim()
  const company = (o.company || '').trim()
  const location = (o.location || '').trim()
  const url = (o.url || '').trim()
  const description = (o.description || '').trim()

  return {
    id: o.id || makeId(),
    title,
    company,
    location,
    url,
    description,
    status: o.status || 'saved', // saved | applied | interview | rejected
    notes: (o.notes || '').trim(),
    createdAt: o.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
}

const readAll = () => {
  const raw = localStorage.getItem(OFFERS_KEY)
  const list = safeJsonParse(raw, [])
  return Array.isArray(list) ? list : []
}

const writeAll = list => {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(list))
}

export const offersService = {
  getOffers() {
    const offers = readAll()
    // newest first
    return offers.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  },

  getOfferById(id) {
    if (!id) return null
    return readAll().find(o => o.id === id) || null
  },

  createOffer(partial) {
    const offer = normalizeOffer(partial)

    // Minimal validation: title OR company OR url should exist
    if (!offer.title && !offer.company && !offer.url) {
      throw new Error('Offer must have at least a title, company, or URL')
    }

    const list = readAll()
    writeAll([offer, ...list])
    return offer.id
  },

  updateOffer(id, patch) {
    if (!id) throw new Error('Missing offer id')

    const list = readAll()
    const idx = list.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Offer not found')

    const updated = normalizeOffer({ ...list[idx], ...(patch || {}), id })
    const next = [...list]
    next[idx] = updated
    writeAll(next)
    return updated
  },

  deleteOffer(id) {
    if (!id) return
    const list = readAll().filter(o => o.id !== id)
    writeAll(list)

    const activeId = localStorage.getItem(ACTIVE_OFFER_KEY)
    if (activeId === id) localStorage.removeItem(ACTIVE_OFFER_KEY)
  },

  // Active offer helpers
  setActiveOffer(id) {
    if (!id) {
      localStorage.removeItem(ACTIVE_OFFER_KEY)
      return
    }
    localStorage.setItem(ACTIVE_OFFER_KEY, id)
  },

  getActiveOfferId() {
    return localStorage.getItem(ACTIVE_OFFER_KEY)
  },

  getActiveOffer() {
    const id = offersService.getActiveOfferId()
    return id ? offersService.getOfferById(id) : null
  },

  clearActiveOffer() {
    localStorage.removeItem(ACTIVE_OFFER_KEY)
  },
}
