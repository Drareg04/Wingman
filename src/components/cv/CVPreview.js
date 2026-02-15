import React from 'react';

function CVPreview({ data }) {
    // A simple, clean "Modern" template
    return (
        <div className="cv-paper" style={{
            width: '210mm',
            minHeight: '297mm',
            background: 'white',
            padding: '40px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            color: '#333',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5'
        }}>

            {/* HEADER */}
            <div style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {data.personalInfo?.name || "TU NOMBRE"}
                </h1>
                <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#666', fontWeight: '400' }}>
                    {data.personalInfo?.title || "TÍTULO PROFESIONAL"}
                </h2>

                <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '20px' }}>
                    <span>📧 {data.personalInfo?.email || "email@ejemplo.com"}</span>
                    <span>📱 {data.personalInfo?.phone || "+34 123 456 789"}</span>
                </div>
            </div>

            {/* SUMMARY */}
            {data.summary && (
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', color: '#333' }}>
                        Resumen
                    </h3>
                    <p style={{ margin: 0, color: '#444' }}>{data.summary}</p>
                </div>
            )}

            {/* EXPERIENCE */}
            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', color: '#333' }}>
                    Experiencia Profesional
                </h3>

                {(!data.experience || data.experience.length === 0) ? (
                    <p style={{ color: '#aaa', fontStyle: 'italic' }}>Añade tu experiencia para verla aquí...</p>
                ) : (
                    data.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 'bold' }}>{exp.role}</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>{exp.years}</span>
                            </div>
                            <div style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '5px' }}>{exp.company}</div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>{exp.description}</p>
                        </div>
                    ))
                )}
            </div>

            {/* EDUCATION */}
            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', color: '#333' }}>
                    Educación
                </h3>

                {data.education?.map((edu, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold' }}>{edu.degree}</span>
                            <span style={{ fontSize: '12px', color: '#666' }}>{edu.year}</span>
                        </div>
                        <div style={{ fontSize: '13px' }}>{edu.school}</div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default CVPreview;
