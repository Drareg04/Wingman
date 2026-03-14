import React, { useMemo, useRef, useState, useEffect } from 'react'
import centres from '../../data/educational_centres.json'

/**
 * Autocomplete dropdown over a static JSON dataset (OpenDataBCN centres).
 * Value is a string (centre name).
 */
export default function EducationalCentreSelect({ value, onChange, placeholder, style }) {
  const [query, setQuery] = useState(() => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') return value.name || ''
    return ''
  })
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const wrapperRef = useRef(null)
  const pagesRowRef = useRef(null)

  const PAGE_SIZE = 25

  useEffect(() => {
    if (!value) {
      setQuery('')
      return
    }
    if (typeof value === 'string') setQuery(value)
    else if (typeof value === 'object') setQuery(value.name || '')
  }, [value])

  useEffect(() => {
    const onDocDown = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [])

  useEffect(() => {
    // al cambiar query, volvemos siempre a la primera página
    setPage(1)
  }, [query])

  useEffect(() => {
    // Cuando cambie la página, aseguramos que la fila de botones vuelve al inicio
    // para que se vean siempre 1,2,3 (si existen)
    if (!open) return
    const el = pagesRowRef.current
    if (el) el.scrollLeft = 0
  }, [page, open])

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase()
    if (!open) return []

    // Si no hay query suficiente, devolvemos todo (paginado) pero sin filtrar
    if (q.length < 2) {
      return centres.filter(c => (c?.name || '').trim().length > 0)
    }

    const starts = []
    const contains = []

    for (const c of centres) {
      const name = (c.name || '').toLowerCase()
      const town = (c.addresses_town || '').toLowerCase()
      const road = (c.addresses_road_name || '').toLowerCase()

      if (!name) continue

      const hay = `${name} ${town} ${road}`
      if (name.startsWith(q)) starts.push(c)
      else if (hay.includes(q)) contains.push(c)
    }

    return [...starts, ...contains]
  }, [query, open])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  }, [filtered.length])

  const results = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page, totalPages])

  const pagesToShow = useMemo(() => {
    // mostramos un rango pequeño alrededor de la página actual
    const maxButtons = 7
    const half = Math.floor(maxButtons / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPages, start + maxButtons - 1)
    start = Math.max(1, end - maxButtons + 1)
    const arr = []
    for (let p = start; p <= end; p++) arr.push(p)
    return arr
  }, [page, totalPages])

  const handleSelect = c => {
    const nextVal = {
      name: c?.name || '',
      addresses_road_name: c?.addresses_road_name || '',
      addresses_town: c?.addresses_town || '',
    }
    setQuery(nextVal.name)
    setOpen(false)
    onChange?.(nextVal)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type='text'
        value={query}
        placeholder={placeholder}
        style={style}
        onFocus={() => setOpen(true)}
        onChange={e => {
          const v = e.target.value
          setQuery(v)
          setOpen(true)
          // mientras escribe, guardamos como texto
          onChange?.(v)
        }}
      />

      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            zIndex: 2000,
            overflow: 'hidden',
          }}
        >
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {results.map((c, idx) => (
              <button
                key={`${c.name}-${c.addresses_road_name}-${c.addresses_town}-${idx}`}
                type='button'
                onClick={() => handleSelect(c)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  borderBottom: idx < results.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {(c.addresses_road_name || '').trim()}
                  {c.addresses_road_name && c.addresses_town ? ' · ' : ''}
                  {(c.addresses_town || '').trim()}
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '8px 10px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type='button'
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  border: 'none',
                  background: page <= 1 ? '#e2e8f0' : '#cbd5e1',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 900,
                  color: '#0f172a',
                  flexShrink: 0,
                }}
              >
                ←
              </button>

              {/* Horizontal pages row (no vertical stacking) */}
              <div
                ref={pagesRowRef}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flex: 1,
                  justifyContent: 'center',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  whiteSpace: 'nowrap',
                  padding: '2px 2px',
                  scrollBehavior: 'smooth',
                }}
              >
                {pagesToShow[0] > 1 && (
                  <>
                    <PageBtn n={1} active={page === 1} onClick={() => setPage(1)} />
                    {pagesToShow[0] > 2 && <span style={{ color: '#94a3b8', fontWeight: 900, flexShrink: 0 }}>…</span>}
                  </>
                )}

                {pagesToShow.map(p => (
                  <PageBtn key={p} n={p} active={page === p} onClick={() => setPage(p)} />
                ))}

                {pagesToShow[pagesToShow.length - 1] < totalPages && (
                  <>
                    {pagesToShow[pagesToShow.length - 1] < totalPages - 1 && <span style={{ color: '#94a3b8', fontWeight: 900, flexShrink: 0 }}>…</span>}
                    <PageBtn n={totalPages} active={page === totalPages} onClick={() => setPage(totalPages)} />
                  </>
                )}
              </div>

              <button
                type='button'
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  border: 'none',
                  background: page >= totalPages ? '#e2e8f0' : '#cbd5e1',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 900,
                  color: '#0f172a',
                  flexShrink: 0,
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PageBtn({ n, active, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        border: 'none',
        background: active ? '#3b82f6' : '#e2e8f0',
        color: active ? 'white' : '#0f172a',
        borderRadius: 8,
        padding: '6px 10px',
        cursor: 'pointer',
        fontWeight: 900,
        minWidth: 34,
        flexShrink: 0,
      }}
    >
      {n}
    </button>
  )
}
