import React from 'react'
import EducationalCentreSelect from './EducationalCentreSelect'

function CVForm({ data, onChange, onAdd, onRemove }) {
  const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }
  const sectionStyle = { padding: '20px', borderBottom: '1px solid #eee' }
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }

  return (
    <div>
      {/* --- PERSONAL INFO --- */}
      <div style={sectionStyle}>
        <h4 style={{ marginTop: 0 }}>👤 Datos Personales</h4>
        <label style={labelStyle}>Nombre Completo</label>
        <input type='text' style={inputStyle} value={data.personalInfo?.name || ''} onChange={e => onChange('personalInfo', 'name', e.target.value)} placeholder='Ej: Ana García' />
        <label style={labelStyle}>Título Profesional</label>
        <input type='text' style={inputStyle} value={data.personalInfo?.title || ''} onChange={e => onChange('personalInfo', 'title', e.target.value)} placeholder='Ej: Frontend Developer' />
        <label style={labelStyle}>Email</label>
        <input type='text' style={inputStyle} value={data.personalInfo?.email || ''} onChange={e => onChange('personalInfo', 'email', e.target.value)} />
        <label style={labelStyle}>Teléfono</label>
        <input type='text' style={inputStyle} value={data.personalInfo?.phone || ''} onChange={e => onChange('personalInfo', 'phone', e.target.value)} />
      </div>

      {/* --- SUMMARY --- */}
      <div style={sectionStyle}>
        <h4 style={{ marginTop: 0 }}>📝 Resumen Profesional</h4>
        <textarea
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          value={data.summary || ''}
          onChange={e => onChange(null, 'summary', e.target.value)}
          placeholder='Describe tu perfil en unas líneas...'
        />
      </div>

      {/* --- EXPERIENCE --- */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ marginTop: 0, marginBottom: 0 }}>💼 Experiencia</h4>
          <button
            onClick={() => onAdd('experience', { role: '', company: '', years: '', description: '' })}
            style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
          >
            +
          </button>
        </div>

        {data.experience?.map((exp, index) => (
          <div key={index} style={{ background: 'white', padding: '10px', borderRadius: '5px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <button onClick={() => onRemove('experience', index)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                🗑️
              </button>
            </div>
            <input type='text' style={inputStyle} value={exp.role} onChange={e => onChange('experience', 'role', e.target.value, index)} placeholder='Puesto (ej. Product Manager)' />
            <input type='text' style={inputStyle} value={exp.company} onChange={e => onChange('experience', 'company', e.target.value, index)} placeholder='Empresa' />
            <input type='text' style={inputStyle} value={exp.years} onChange={e => onChange('experience', 'years', e.target.value, index)} placeholder='Fechas (ej. 2020 - 2023)' />
            <textarea
              style={{ ...inputStyle, height: '60px' }}
              value={exp.description}
              onChange={e => onChange('experience', 'description', e.target.value, index)}
              placeholder='Logros y responsabilidades...'
            />
          </div>
        ))}
        {(!data.experience || data.experience.length === 0) && <p style={{ fontSize: '0.8rem', color: '#aaa' }}>No hay experiencia añadida.</p>}
      </div>

      {/* --- EDUCATION --- */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ marginTop: 0, marginBottom: 0 }}>🎓 Educación</h4>
          <button
            onClick={() => onAdd('education', { degree: '', school: '', year: '', schoolLogo: null })}
            style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
          >
            +
          </button>
        </div>

        {data.education?.map((edu, index) => (
          <div key={index} style={{ background: 'white', padding: '10px', borderRadius: '5px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <button onClick={() => onRemove('education', index)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                🗑️
              </button>
            </div>
            <input type='text' style={inputStyle} value={edu.degree} onChange={e => onChange('education', 'degree', e.target.value, index)} placeholder='Título (ej. Grado en Ingeniería)' />

            <EducationalCentreSelect
              value={edu.schoolMeta || edu.school || ''}
              onChange={val => {
                if (typeof val === 'string') {
                  onChange('education', 'school', val, index)
                  onChange('education', 'schoolMeta', null, index)
                } else {
                  onChange('education', 'school', val.name || '', index)
                  onChange('education', 'schoolMeta', val, index)
                }
              }}
              placeholder='Institución Educativa (busca y filtra)'
              style={inputStyle}
            />

            {edu.schoolMeta && (edu.schoolMeta.addresses_road_name || edu.schoolMeta.addresses_town) && (
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-6px', marginBottom: '10px' }}>
                {edu.schoolMeta.addresses_road_name}
                {edu.schoolMeta.addresses_road_name && edu.schoolMeta.addresses_town ? ' · ' : ''}
                {edu.schoolMeta.addresses_town}
              </div>
            )}

            <input type='text' style={inputStyle} value={edu.year} onChange={e => onChange('education', 'year', e.target.value, index)} placeholder='Año' />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CVForm
