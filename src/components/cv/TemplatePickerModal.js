import React from 'react'
import TemplateSelector from './TemplateSelector'

export default function TemplatePickerModal({ isOpen, onClose, selectedTemplate, onSelect }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        boxSizing: 'border-box',
      }}
      onMouseDown={onClose}
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        style={{
          width: 'min(980px, 95vw)',
          maxHeight: '85vh',
          overflow: 'auto',
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 900, color: '#0f172a' }}>Elige una plantilla</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Puedes cambiarla luego en el editor.</div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#e2e8f0',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            Cerrar
          </button>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
          <TemplateSelector selectedTemplate={selectedTemplate} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}
