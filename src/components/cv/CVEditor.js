import React, { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import CVForm from './CVForm'
import CVPreview from './CVPreview'
import TemplateSelector from './TemplateSelector'
import { storageService } from '../../services/storage'
import { useAuth } from '../../context/AuthContext'

function CVEditor({ cvId, onBack }) {
  const { currentUser } = useAuth()
  // Load full CV object (wrapper) or default
  const [cvWrapper, setCvWrapper] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const found = await storageService.getCVById(cvId, currentUser)
      // If not found, look for any default or create empty wrapper
      if (found) {
        setCvWrapper(found)
      } else {
        const all = await storageService.getCVs(currentUser)
        setCvWrapper({ data: all[0]?.data || {} })
      }
      setLoading(false)
    }
    load()
  }, [cvId, currentUser])

  // We work with the 'data' part, but need 'id' and 'name' for saving
  const [cvData, setCvData] = useState(null)
  const [cvName, setCvName] = useState('Mi CV')
  const [selectedTemplate, setSelectedTemplate] = useState('modern')

  // Sync state when wrapper loads
  useEffect(() => {
    if (cvWrapper) {
      setCvData(cvWrapper.data || {})
      setCvName(cvWrapper.name || 'Mi CV')
      setSelectedTemplate((cvWrapper.data && cvWrapper.data.template) || 'modern')
    }
  }, [cvWrapper])

  const handleSave = async () => {
    if (!cvData) return
    await storageService.saveCV(cvId, cvData, cvName, currentUser)
    alert('CV Guardado correctamente')
  }

  const handleExportPDF = async () => {
    const paper = document.querySelector('.cv-print-root .cv-paper')
    if (!paper) {
      alert('No se pudo encontrar el CV para exportar.')
      return
    }

    const renderToPdf = async canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pageHeight

      while (heightLeft > 1) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pageHeight
      }

      const safeName = (cvName || 'CV').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'CV'
      pdf.save(`${safeName}.pdf`)
    }

    // 1) Primer intento: con CORS habilitado
    try {
      const canvas = await html2canvas(paper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      })
      await renderToPdf(canvas)
      return
    } catch (e1) {
      console.error('PDF export first attempt failed:', e1)
    }

    // 2) Segundo intento: ignorar imágenes externas problemáticas
    try {
      const canvas = await html2canvas(paper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        ignoreElements: el => {
          // Si alguna imagen/logo rompe por CORS, la omitimos
          if (el && el.tagName === 'IMG') return true
          return false
        },
      })
      await renderToPdf(canvas)
      alert('PDF exportado. Nota: se han omitido imágenes para evitar errores de CORS.')
      return
    } catch (e2) {
      console.error('PDF export second attempt failed:', e2)
      alert('No se pudo exportar a PDF. Revisa si tienes imágenes/fotos en el CV (pueden bloquearse por CORS).')
    }
  }

  const handleChange = (section, field, value, index = null) => {
    setCvData(prevCoords => {
      // 1. Top-level fields (like 'summary')
      if (!section) {
        return { ...prevCoords, [field]: value }
      }

      // 2. Nested objects (like 'personalInfo')
      // If index is null, we assume we are updating a field in a section object
      if (index === null) {
        const currentSection = prevCoords[section]
        // Only proceed if it's NOT an array (because arrays are handled in case 3)
        if (!Array.isArray(currentSection)) {
          return {
            ...prevCoords,
            [section]: {
              ...(currentSection || {}), // Create if undefined/null
              [field]: value,
            },
          }
        }
      }

      // 3. Arrays (like 'experience' or 'education')
      if (index !== null && Array.isArray(prevCoords[section])) {
        const newArray = [...prevCoords[section]]
        newArray[index] = { ...newArray[index], [field]: value }
        return { ...prevCoords, [section]: newArray }
      }

      return prevCoords
    })
  }

  const addItem = (section, initialItem) => {
    setCvData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), initialItem],
    }))
  }

  const removeItem = (section, index) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }))
  }

  if (loading || !cvData) return <div style={{ padding: 20, color: 'white' }}>Cargando Editor...</div>

  return (
    <div
      className='cv-editor-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0 20px 20px 20px',
        boxSizing: 'border-box',
      }}
    >
      {/* --- TOP BAR --- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '15px',
          marginBottom: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          gap: '15px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          ⬅ Volver
        </button>

        <input
          value={cvName}
          onChange={e => setCvName(e.target.value)}
          style={{
            flex: 1,
            maxWidth: '300px',
            padding: '8px 12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            textAlign: 'center',
          }}
        />

        <button
          onClick={handleExportPDF}
          className='btn-export'
          style={{
            padding: '8px 18px',
            cursor: 'pointer',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
          title='Abre el diálogo de impresión para guardar como PDF'
        >
          ⬇️ PDF
        </button>

        <button
          onClick={handleSave}
          style={{
            padding: '8px 20px',
            cursor: 'pointer',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          💾 Guardar
        </button>
      </div>

      {/* --- MAIN LAYOUT: Form Left | Preview Center | Templates Right --- */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        {/* LEFT: Form Panel — scroll inside, fixed height */}
        <div
          style={{
            width: '280px',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            padding: '20px',
            boxSizing: 'border-box',
            height: 'calc(100vh - 160px)',
            overflowY: 'auto',
            position: 'sticky',
            top: '80px',
          }}
        >
          <CVForm data={cvData} onChange={handleChange} onAdd={addItem} onRemove={removeItem} />
        </div>

        {/* CENTER: Preview Panel — zoom instead of scale to avoid empty space */}
        <div
          style={{
            flex: 1,
            background: '#f1f5f9',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'hidden',
          }}
        >
          {/*
            Pantalla: usamos zoom para encajar en el panel.
            Impresión: renderizamos una copia a tamaño 100% (sin zoom) y
            la hacemos visible vía @media print (App.css).
          */}
          <div style={{ zoom: 0.7, width: '210mm' }}>
            <CVPreview data={cvData} template={selectedTemplate} />
          </div>
        </div>

        {/* RIGHT: Templates Panel — sticky */}
        <div
          style={{
            width: '220px',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            padding: '16px',
            boxSizing: 'border-box',
            position: 'sticky',
            top: '80px',
          }}
        >
          <p
            style={{
              margin: '0 0 12px 0',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Template
          </p>
          <TemplateSelector selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
        </div>
      </div>

      {/*
        Printable/exportable version (offscreen):
        - Debe estar renderizada (NO display:none) para que html2canvas pueda capturarla.
        - La sacamos del flujo visual.
      */}
      <div
        className='cv-print-root'
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '210mm',
          background: 'white',
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        <CVPreview data={cvData} template={selectedTemplate} />
      </div>
    </div>
  )
}

export default CVEditor
