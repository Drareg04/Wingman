import React from 'react'

const templates = [
  // Free Templates
  { id: 'modern', name: 'Moderno', color: '#3b82f6', icon: '📄', isPro: false },
  { id: 'minimalist', name: 'Minimalista', color: '#10b981', icon: '📝', isPro: false },
  { id: 'pixel', name: 'Pixel Art', color: '#f97316', icon: '👾', isPro: false },
  { id: 'executive', name: 'Ejecutivo', color: '#1e40af', icon: '👔', isPro: false },
  { id: 'creative', name: 'Creativo', color: '#06b6d4', icon: '🎨', isPro: false },

  // Pro Templates
  { id: 'pro-editorial', name: 'Editorial', color: '#475569', icon: '📸', isPro: true },
  { id: 'pro-dark', name: 'Oscuro', color: '#1e293b', icon: '🦇', isPro: true },
  { id: 'pro-border', name: 'Vanguardia', color: '#6366f1', icon: '🟦', isPro: true },
  { id: 'pro-y2k', name: 'Y2K Win98', color: '#d946ef', icon: '💾', isPro: true },
]

function TemplateSelector({ selectedTemplate, onSelect }) {
  // Para la demo, el usuario ha pedido dejar las plantillas gratis por ahora.
  const userIsPro = true

  const handleSelect = tpl => {
    onSelect(tpl.id)
  }

  return (
    <div
      className='template-selector-container'
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        background: 'transparent',
        padding: '0',
      }}
    >
      {templates.map(tpl => {
        return (
          <div
            key={tpl.id}
            onClick={() => handleSelect(tpl)}
            style={{
              height: '90px',
              background: selectedTemplate === tpl.id ? 'white' : '#f8fafc',
              border: `3px solid ${selectedTemplate === tpl.id ? tpl.color : '#e2e8f0'}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: selectedTemplate === tpl.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedTemplate === tpl.id ? `0 5px 15px ${tpl.color}40` : 'none',
            }}
          >
            <span style={{ fontSize: '2rem' }}>{tpl.icon}</span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: selectedTemplate === tpl.id ? tpl.color : '#64748b',
                marginTop: '5px',
              }}
            >
              {tpl.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default TemplateSelector
