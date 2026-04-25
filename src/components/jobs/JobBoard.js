import React, { useMemo, useState } from 'react'
import { offersService } from '../../services/offers'

function JobBoard({ onSelectOffer, onBack }) {
  const [version, setVersion] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')

  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', url: '', description: '', notes: '' })

  const jobs = useMemo(() => {
    const all = offersService.getOffers()
    const q = (query || '').trim().toLowerCase()
    if (!q) return all
    return all.filter(o => {
      return [o.title, o.company, o.location, o.description].some(v => (v || '').toLowerCase().includes(q))
    })
  }, [version, query])

  const activeId = offersService.getActiveOfferId()

  const refresh = () => setVersion(v => v + 1)

  const handleAddJob = () => {
    try {
      const id = offersService.createOffer(newJob)
      offersService.setActiveOffer(id)
      setShowForm(false)
      setNewJob({ title: '', company: '', location: '', url: '', description: '', notes: '' })
      refresh()
    } catch (e) {
      alert('Omple com a mínim el títol, l’empresa o l’URL.')
    }
  }

  const handleDelete = id => {
    if (!window.confirm('Vols eliminar aquesta oferta?')) return
    offersService.deleteOffer(id)
    refresh()
  }

  const handleSelect = offer => {
    offersService.setActiveOffer(offer.id)
    refresh()
    onSelectOffer?.(offer)
  }

  const toggleStatus = offer => {
    const next = offer.status === 'saved' ? 'applied' : offer.status === 'applied' ? 'interview' : offer.status === 'interview' ? 'rejected' : 'saved'
    offersService.updateOffer(offer.id, { status: next })
    refresh()
  }

  return (
    <div className='panel-card' style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>📂 GESTIÓ D’OFERTES</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type='text'
            placeholder='Cerca (títol, empresa, ciutat...)'
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ minWidth: 260, padding: '10px 12px', borderRadius: 12, border: '2px solid #cbd5e1' }}
          />
          <button className='btn-pixel' onClick={() => setShowForm(!showForm)} style={{ width: 'auto' }}>
            {showForm ? 'CANCEL·LAR' : '+ AFEGIR OFERTA'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className='job-form' style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '10px', marginTop: '15px', marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0 }}>Nova oferta</h4>
          <input
            type='text'
            placeholder='Títol (ex. React Dev)'
            value={newJob.title}
            onChange={e => setNewJob({ ...newJob, title: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px 12px' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              type='text'
              placeholder='Empresa'
              value={newJob.company}
              onChange={e => setNewJob({ ...newJob, company: e.target.value })}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px 12px' }}
            />
            <input
              type='text'
              placeholder='Ubicació (opcional)'
              value={newJob.location}
              onChange={e => setNewJob({ ...newJob, location: e.target.value })}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px 12px' }}
            />
          </div>
          <input
            type='text'
            placeholder='URL (opcional)'
            value={newJob.url}
            onChange={e => setNewJob({ ...newJob, url: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px 12px' }}
          />
          <textarea
            placeholder='Descripció de l’oferta...'
            value={newJob.description}
            onChange={e => setNewJob({ ...newJob, description: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px 12px', minHeight: '120px' }}
          />
          <textarea
            placeholder='Notes (opcional)'
            value={newJob.notes}
            onChange={e => setNewJob({ ...newJob, notes: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px 12px', minHeight: '70px' }}
          />
          <button className='btn-pixel' onClick={handleAddJob} style={{ width: 'auto' }}>
            GUARDAR
          </button>
        </div>
      )}

      <div className='job-grid'>
        {jobs.length === 0 && <p>No hi ha ofertes.</p>}

        {jobs.map(job => (
          <div key={job.id} className='job-card'>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <span className='status-badge' style={{ textTransform: 'uppercase' }}>
                {job.status}
              </span>
              {activeId === job.id && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af' }}>ACTIVA</span>}
            </div>

            <h3 style={{ marginBottom: 6 }}>{job.title || '(Sense títol)'}</h3>
            <p style={{ fontWeight: 'bold', margin: '0 0 6px 0' }}>{job.company || '(Sense empresa)'}</p>
            {job.location && <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b' }}>📍 {job.location}</p>}

            {job.description && <p style={{ fontSize: '0.85rem' }}>{job.description}</p>}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button className='btn-pixel' style={{ fontSize: '0.9rem', padding: '6px 12px', width: 'auto' }} onClick={() => handleSelect(job)}>
                PRACTICAR
              </button>

              <button className='btn-pixel btn-pixel-gray' style={{ fontSize: '0.9rem', padding: '6px 12px', width: 'auto' }} onClick={() => toggleStatus(job)} title='Canviar estat'>
                ESTAT
              </button>

              <button
                className='btn-pixel'
                style={{ fontSize: '0.9rem', padding: '6px 12px', width: 'auto', background: '#ef4444', borderBottomColor: '#b91c1c' }}
                onClick={() => handleDelete(job.id)}
              >
                ESBORRAR
              </button>

              {job.url && (
                <a href={job.url} target='_blank' rel='noreferrer' style={{ fontSize: '0.85rem', alignSelf: 'center' }}>
                  Obrir enllaç
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className='btn-back' onClick={onBack}>
          ⬅ TORNAR AL MENÚ
        </button>
      </div>
    </div>
  )
}

export default JobBoard
