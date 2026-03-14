import React, { useMemo, useState } from 'react'
import EducationalCentreSelect from './EducationalCentreSelect'

/**
 * Flujo guiado para crear un CV mediante preguntas.
 * - No usa IA (Sprint 1).
 * - Genera una estructura compatible con CVPreview/CVEditor.
 */
export default function CVQuestionnaire({ onCancel, onFinish }) {
  const steps = useMemo(
    () => [
      {
        id: 'personal',
        title: 'Datos básicos',
        fields: [
          { key: 'personalInfo.name', label: 'Nombre completo', placeholder: 'Ej: Ana García', type: 'text' },
          { key: 'personalInfo.title', label: 'Título profesional', placeholder: 'Ej: Frontend Developer', type: 'text' },
          { key: 'personalInfo.email', label: 'Email', placeholder: 'ana@email.com', type: 'text' },
          { key: 'personalInfo.phone', label: 'Teléfono', placeholder: '+34 600 000 000', type: 'text' },
          { key: 'personalInfo.location', label: 'Ubicación', placeholder: 'Barcelona, España', type: 'text' },
          { key: 'personalInfo.links', label: 'Links (LinkedIn/Portfolio)', placeholder: 'https://linkedin.com/in/...', type: 'text' },
        ],
      },
      {
        id: 'summary',
        title: 'Resumen profesional',
        fields: [
          {
            key: 'summary',
            label: 'Cuéntanos en 3-5 líneas quién eres y qué buscas',
            placeholder: 'Ej: Desarrollador/a con 3 años en React... ',
            type: 'textarea',
          },
        ],
      },
      {
        id: 'experience',
        title: 'Experiencia (1 puesto)',
        hint: 'Luego podrás añadir más en el editor.',
        fields: [
          { key: 'experience.0.role', label: 'Puesto', placeholder: 'Frontend Developer', type: 'text' },
          { key: 'experience.0.company', label: 'Empresa', placeholder: 'Empresa S.A.', type: 'text' },
          { key: 'experience.0.years', label: 'Fechas', placeholder: '2022 - 2025', type: 'text' },
          { key: 'experience.0.description', label: 'Logros / responsabilidades', placeholder: '• Implementé...\n• Optimicé...', type: 'textarea' },
        ],
      },
      {
        id: 'education',
        title: 'Educación (1 formación)',
        hint: 'Luego podrás añadir más en el editor.',
        fields: [
          { key: 'education.0.degree', label: 'Título', placeholder: 'Grado en Ingeniería...', type: 'text' },
          { key: 'education.0.school', label: 'Centro', placeholder: 'Universidad / Instituto', type: 'text' },
          { key: 'education.0.year', label: 'Año / periodo', placeholder: '2018 - 2022', type: 'text' },
        ],
      },
      {
        id: 'skills',
        title: 'Skills',
        fields: [
          {
            key: 'skills',
            label: 'Lista de habilidades (separadas por coma o salto de línea)',
            placeholder: 'React, JavaScript, CSS, Git',
            type: 'textarea',
          },
          {
            key: 'languages',
            label: 'Idiomas (opcional)',
            placeholder: 'Español (nativo), Catalán (C1), Inglés (B2)',
            type: 'textarea',
          },
        ],
      },
    ],
    []
  )

  const [stepIndex, setStepIndex] = useState(0)
  const [cvName, setCvName] = useState('Mi CV')
  const [answers, setAnswers] = useState({
    personalInfo: { name: '', title: '', email: '', phone: '', location: '', links: '' },
    summary: '',
    experience: [{ role: '', company: '', years: '', description: '' }],
    education: [{ degree: '', school: '', year: '' }],
    skills: '',
    languages: '',
  })

  const setByPath = (path, value) => {
    const parts = path.split('.')
    setAnswers(prev => {
      const next = structuredClone(prev)
      let cur = next
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i]
        const idx = Number.isNaN(Number(p)) ? null : Number(p)
        if (idx !== null && Array.isArray(cur)) {
          cur = cur[idx]
        } else {
          cur = cur[p]
        }
      }
      const last = parts[parts.length - 1]
      const lastIdx = Number.isNaN(Number(last)) ? null : Number(last)
      if (lastIdx !== null && Array.isArray(cur)) cur[lastIdx] = value
      else cur[last] = value
      return next
    })
  }

  const current = steps[stepIndex]
  const isLast = stepIndex === steps.length - 1

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    padding: 20,
    maxWidth: 720,
    margin: '0 auto',
  }

  const inputStyle = {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    fontSize: 14,
  }

  const labelStyle = { display: 'block', fontWeight: 700, marginBottom: 6, color: '#334155' }

  const canNext = () => {
    // Reglas mínimas: nombre y email en el primer paso
    if (current.id === 'personal') {
      return (answers.personalInfo.name || '').trim().length >= 2
    }
    return true
  }

  const addExperience = () => {
    setAnswers(prev => ({
      ...prev,
      experience: [...(prev.experience || []), { role: '', company: '', years: '', description: '' }],
    }))
  }

  const removeExperience = index => {
    setAnswers(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }))
  }

  const addEducation = () => {
    setAnswers(prev => ({
      ...prev,
      education: [...(prev.education || []), { degree: '', school: '', year: '' }],
    }))
  }

  const removeEducation = index => {
    setAnswers(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }))
  }

  return (
    <div style={{ padding: '30px 20px', boxSizing: 'border-box' }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              background: '#e2e8f0',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ⬅ Volver
          </button>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 900, letterSpacing: 0.5, color: '#0f172a' }}>Crear CV con preguntas</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Paso {stepIndex + 1} de {steps.length} · {current.title}
            </div>
          </div>

          <div style={{ width: 90 }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre del CV</label>
          <input value={cvName} onChange={e => setCvName(e.target.value)} style={inputStyle} />
        </div>

        {current.hint && <div style={{ marginBottom: 14, fontSize: 13, color: '#64748b' }}>{current.hint}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {current.fields.map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  value={getValueByPath(answers, f.key) || ''}
                  placeholder={f.placeholder}
                  onChange={e => setByPath(f.key, e.target.value)}
                />
              ) : (
                <input style={inputStyle} value={getValueByPath(answers, f.key) || ''} placeholder={f.placeholder} onChange={e => setByPath(f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>

        {/* Dynamic repeaters for experience / education */}
        {current.id === 'experience' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 900, color: '#0f172a' }}>Puestos añadidos: {(answers.experience || []).length}</div>
              <button
                onClick={addExperience}
                type='button'
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                + Añadir otro
              </button>
            </div>

            {(answers.experience || []).map((_, idx) => (
              <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, marginBottom: 10, background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, color: '#334155' }}>Experiencia #{idx + 1}</div>
                  <button
                    type='button'
                    onClick={() => removeExperience(idx)}
                    disabled={(answers.experience || []).length <= 1}
                    title={(answers.experience || []).length <= 1 ? 'Debe haber al menos 1 experiencia' : 'Eliminar'}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 10,
                      border: 'none',
                      background: (answers.experience || []).length <= 1 ? '#e2e8f0' : '#fee2e2',
                      color: '#991b1b',
                      cursor: (answers.experience || []).length <= 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                    }}
                  >
                    Eliminar
                  </button>
                </div>

                {/* Fields for this experience */}
                <label style={labelStyle}>Puesto</label>
                <input style={inputStyle} value={answers.experience?.[idx]?.role || ''} onChange={e => setByPath(`experience.${idx}.role`, e.target.value)} placeholder='Frontend Developer' />

                <div style={{ height: 10 }} />

                <label style={labelStyle}>Empresa</label>
                <input style={inputStyle} value={answers.experience?.[idx]?.company || ''} onChange={e => setByPath(`experience.${idx}.company`, e.target.value)} placeholder='Empresa S.A.' />

                <div style={{ height: 10 }} />

                <label style={labelStyle}>Fechas</label>
                <input style={inputStyle} value={answers.experience?.[idx]?.years || ''} onChange={e => setByPath(`experience.${idx}.years`, e.target.value)} placeholder='2022 - 2025' />

                <div style={{ height: 10 }} />

                <label style={labelStyle}>Logros / responsabilidades</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  value={answers.experience?.[idx]?.description || ''}
                  onChange={e => setByPath(`experience.${idx}.description`, e.target.value)}
                  placeholder={'• Implementé...\n• Optimicé...'}
                />
              </div>
            ))}
          </div>
        )}

        {current.id === 'education' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 900, color: '#0f172a' }}>Formaciones añadidas: {(answers.education || []).length}</div>
              <button
                onClick={addEducation}
                type='button'
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                + Añadir otra
              </button>
            </div>

            {(answers.education || []).map((_, idx) => (
              <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, marginBottom: 10, background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, color: '#334155' }}>Educación #{idx + 1}</div>
                  <button
                    type='button'
                    onClick={() => removeEducation(idx)}
                    disabled={(answers.education || []).length <= 1}
                    title={(answers.education || []).length <= 1 ? 'Debe haber al menos 1 formación' : 'Eliminar'}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 10,
                      border: 'none',
                      background: (answers.education || []).length <= 1 ? '#e2e8f0' : '#fee2e2',
                      color: '#991b1b',
                      cursor: (answers.education || []).length <= 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                    }}
                  >
                    Eliminar
                  </button>
                </div>

                <label style={labelStyle}>Título</label>
                <input style={inputStyle} value={answers.education?.[idx]?.degree || ''} onChange={e => setByPath(`education.${idx}.degree`, e.target.value)} placeholder='Grado en Ingeniería...' />

                <div style={{ height: 10 }} />

                <label style={labelStyle}>Centro</label>
                <EducationalCentreSelect
                  value={answers.education?.[idx]?.school || ''}
                  onChange={val => setByPath(`education.${idx}.school`, val)}
                  placeholder='Busca tu centro (nombre / calle / municipio)'
                  style={inputStyle}
                />

                <div style={{ height: 10 }} />

                <label style={labelStyle}>Año / periodo</label>
                <input style={inputStyle} value={answers.education?.[idx]?.year || ''} onChange={e => setByPath(`education.${idx}.year`, e.target.value)} placeholder='2018 - 2022' />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 12 }}>
          <button
            onClick={() => setStepIndex(i => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: stepIndex === 0 ? '#e2e8f0' : '#cbd5e1',
              color: '#0f172a',
              cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              flex: 1,
            }}
          >
            Anterior
          </button>

          {!isLast ? (
            <button
              onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))}
              disabled={!canNext()}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: !canNext() ? '#93c5fd' : '#3b82f6',
                color: 'white',
                cursor: !canNext() ? 'not-allowed' : 'pointer',
                fontWeight: 900,
                flex: 1,
              }}
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={() => onFinish({ cvName, answers })}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#16a34a',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 900,
                flex: 1,
              }}
            >
              Crear CV
            </button>
          )}
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>Al finalizar podrás editar y elegir plantilla.</div>
      </div>
    </div>
  )
}

function getValueByPath(obj, path) {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return ''
    const idx = Number.isNaN(Number(p)) ? null : Number(p)
    cur = idx !== null && Array.isArray(cur) ? cur[idx] : cur[p]
  }
  return cur
}
