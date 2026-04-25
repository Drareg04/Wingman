import React, { useState, useEffect, useRef } from 'react';

// === TEMPLATES LEGACY REUTILIZABLES ===
// (Moderno, Minimalista, Pixel, Ejecutivo, Creativo) comparten estructura
function LegacyTemplate({ data, template }) {
    const styles = {
        modern: { font: '"Helvetica Neue", Helvetica, Arial, sans-serif', bg: 'white', headerBorder: '2px solid #333', titleColor: '#333', accent: '#333' },
        minimalist: { font: '"Garamond", serif', bg: '#fafafa', headerBorder: 'none', titleColor: '#444', accent: '#10b981' },
        pixel: { font: "'VT323', monospace", bg: '#fff1f2', headerBorder: '4px solid #000', titleColor: '#e11d48', accent: '#000' },
        executive: { font: '"Times New Roman", Times, serif', bg: '#fff', headerBorder: '1px solid #0f172a', titleColor: '#0f172a', accent: '#1e40af' },
        creative: { font: '"Poppins", sans-serif', bg: '#f0f9ff', headerBorder: 'none', titleColor: '#0891b2', accent: '#06b6d4' }
    };

    const currentStyle = styles[template] || styles.modern;

    return (
        <div className="cv-paper" style={{
            width: '210mm', height: '297mm', background: currentStyle.bg, padding: '40px',
            color: '#333',
            fontFamily: currentStyle.font, fontSize: template === 'pixel' ? '18px' : '14px',
            lineHeight: '1.5', display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', overflow: 'hidden'
        }}>
            <div style={{
                borderBottom: currentStyle.headerBorder, paddingBottom: '20px', marginBottom: '20px',
                textAlign: template === 'minimalist' ? 'center' : 'left', display: 'flex',
                justifyContent: template === 'minimalist' ? 'center' : 'space-between',
                alignItems: 'center', flexDirection: template === 'minimalist' ? 'column' : 'row'
            }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: template === 'pixel' ? '42px' : '28px', textTransform: 'uppercase', color: currentStyle.titleColor }}>
                        {data.personalInfo?.name || "TU NOMBRE"}
                    </h1>
                    <h2 style={{ margin: '0 0 15px 0', fontSize: template === 'pixel' ? '24px' : '16px', color: '#666', fontWeight: '400' }}>
                        {data.personalInfo?.title || "TÍTULO PROFESIONAL"}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '20px', justifyContent: template === 'minimalist' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                        <span>{data.personalInfo?.email || "email@ejemplo.com"}</span>
                        <span>{data.personalInfo?.phone || "+34 123 456 789"}</span>
                        {data.personalInfo?.address && <span>{data.personalInfo.address}</span>}
                    </div>
                </div>
                {data.personalInfo?.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: template === 'pixel' ? '0' : '50%', border: `2px solid ${currentStyle.accent}`, marginLeft: template === 'minimalist' ? '0' : '20px', marginBottom: template === 'minimalist' ? '15px' : '0', order: template === 'minimalist' ? '-1' : '1' }} />
                )}
            </div>

            {data.summary && (
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ borderBottom: `1px solid ${currentStyle.accent}`, paddingBottom: '5px', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', color: currentStyle.accent }}>Resumen</h3>
                    <p style={{ margin: 0, color: '#444' }}>{data.summary}</p>
                </div>
            )}

            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ borderBottom: `1px solid ${currentStyle.accent}`, paddingBottom: '5px', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', color: currentStyle.accent }}>Experiencia Profesional</h3>
                {(!data.experience || data.experience.length === 0) ? <p style={{ color: '#aaa', fontStyle: 'italic' }}>Añade experiencia...</p> : data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>{exp.role}</span><span style={{ fontSize: '12px', color: '#666' }}>{exp.years}</span></div>
                        <div style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '5px' }}>{exp.company}</div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>{exp.description}</p>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ borderBottom: `1px solid ${currentStyle.accent}`, paddingBottom: '5px', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', color: currentStyle.accent }}>Educación</h3>
                {data.education?.map((edu, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 'bold' }}>{edu.degree}</span><span style={{ fontSize: '12px', color: '#666' }}>{edu.year}</span></div>
                        <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {edu.schoolLogo && <img src={edu.schoolLogo} alt={edu.school} style={{ width: '20px', height: '20px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />}
                            {edu.school}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProY2KTemplate({ data }) {
    const mainFont = "'VT323', monospace";
    return (
        <div className="cv-paper" style={{
            width: '210mm', minHeight: '297mm', background: '#e2e8f0', // Light gray background behind windows
            padding: '20px', boxSizing: 'border-box', fontFamily: mainFont, position: 'relative'
        }}>
            {/* Outer Window Container */}
            <div style={{
                border: '4px solid #1e3a8a', background: '#e0e7ff', height: '100%',
                display: 'flex', flexDirection: 'column', position: 'relative'
            }}>
                {/* Outer Window Title Bar */}
                <div style={{
                    background: '#a5b4fc', borderBottom: '4px solid #1e3a8a', padding: '5px 10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', letterSpacing: '4px' }}>CURRICULUM VITAE</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <div style={{ width: '20px', height: '20px', border: '2px solid #1e3a8a', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>_</div>
                        <div style={{ width: '20px', height: '20px', border: '2px solid #1e3a8a', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☐</div>
                        <div style={{ width: '20px', height: '20px', border: '2px solid #1e3a8a', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>X</div>
                    </div>
                </div>

                {/* Top Section: Contact & Profile Window */}
                <div style={{ display: 'flex', padding: '20px', gap: '20px', borderBottom: '4px dashed #a5b4fc', position: 'relative' }}>

                    {/* Left: Contact Info (Pink Box) */}
                    <div style={{ width: '30%' }}>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1e3a8a' }}>CONTACTO</h2>
                        <div style={{ background: '#fbcfe8', border: '3px solid #1e3a8a', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '16px', marginBottom: '10px' }}>📞 {data.personalInfo?.phone || "(55) 1234 5678"}</div>
                            <div style={{ fontSize: '16px', marginBottom: '10px', wordBreak: 'break-all' }}>✉️ {data.personalInfo?.email || "holamundo@email.com"}</div>
                            <div style={{ fontSize: '16px' }}>🌐 {data.personalInfo?.website || "www.miweb.com"}</div>
                        </div>
                    </div>

                    {/* Right: Floating Profile Window */}
                    <div style={{
                        flex: 1, background: '#f8fafc', border: '4px solid #1e3a8a', position: 'relative',
                        boxShadow: '10px 10px 0px rgba(30, 58, 138, 0.2)', zIndex: 10
                    }}>
                        <div style={{
                            background: '#4f46e5', borderBottom: '4px solid #1e3a8a', padding: '5px',
                            display: 'flex', justifyContent: 'flex-end', gap: '5px'
                        }}>
                            <div style={{ width: '15px', height: '15px', border: '2px solid #1e3a8a', background: 'white' }}></div>
                            <div style={{ width: '15px', height: '15px', border: '2px solid #1e3a8a', background: 'white' }}></div>
                            <div style={{ width: '15px', height: '15px', border: '2px solid #1e3a8a', background: 'white' }}></div>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ margin: '0 0 5px 0', fontSize: '46px', lineHeight: '1', color: '#111827', textTransform: 'uppercase' }}>
                                    {data.personalInfo?.name ? data.personalInfo.name.split(' ')[0] : "NOMBRE"}<br />
                                    {data.personalInfo?.name ? data.personalInfo.name.split(' ').slice(1).join(' ') : "APELLIDO"}
                                </h1>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#4b5563' }}>{data.personalInfo?.title || "Rol Profesional"}</h3>
                                <p style={{ fontSize: '14px', lineHeight: '1.2', color: '#374151' }}>{data.summary || "Soy una persona creativa y entusiasta, con el objetivo de fusionar la estética con la funcionalidad."}</p>
                            </div>
                            {data.personalInfo?.photo && (
                                <img src={data.personalInfo.photo} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #1e3a8a', objectFit: 'cover' }} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: 2 Columns */}
                <div style={{ display: 'flex', flex: 1, padding: '20px', gap: '30px' }}>

                    {/* Left Column: Education & Skills */}
                    <div style={{ width: '35%', position: 'relative' }}>
                        {/* Flower Sticker */}
                        <img
                            src="/flower-sticker.png"
                            alt="Y2K Flower"
                            style={{
                                position: 'absolute', top: '-40px', right: '-20px', width: '80px', height: '80px',
                                zIndex: 100, animation: 'float-y2k 4s ease-in-out infinite', filter: 'drop-shadow(2px 4px 0px rgba(0,0,0,0.2))'
                            }}
                        />
                        <div style={{ background: '#f43f5e', color: 'white', padding: '5px 15px', border: '3px solid #1e3a8a', borderRadius: '20px', display: 'inline-block', fontSize: '24px', marginBottom: '20px' }}>
                            EDUCACIÓN
                        </div>
                        {data.education?.map((edu, i) => (
                            <div key={i} style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '18px', color: '#1e3a8a', lineHeight: '1.2', marginBottom: '5px' }}>{edu.degree}</div>
                                <div style={{ fontSize: '16px', color: '#4b5563' }}>{edu.school}</div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>{edu.year}</div>
                            </div>
                        ))}

                        <div style={{ border: '4px solid #1e3a8a', borderRadius: '10px', padding: '15px', marginTop: '40px', background: '#ecebff' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', textAlign: 'center', color: '#1e3a8a' }}>PROGRAMAS</h3>
                            {/* Faking pie charts with CSS circles */}
                            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '6px solid #f43f5e', borderTopColor: '#fecdd3' }}></div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '6px solid #84cc16', borderRightColor: '#d9f99d' }}></div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '6px solid #4f46e5', borderBottomColor: '#c7d2fe' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Experience */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <h2 style={{ fontSize: '32px', color: '#1e3a8a', marginTop: '0', marginBottom: '20px' }}>EXPERIENCIA LABORAL</h2>

                        {/* Star Sticker */}
                        <img
                            src="/star-sticker.png"
                            alt="Y2K Star"
                            style={{
                                position: 'absolute', bottom: '60px', right: '-20px', width: '90px', height: '90px',
                                zIndex: 100, animation: 'float-y2k-reverse 3s ease-in-out infinite', filter: 'drop-shadow(-2px 4px 0px rgba(0,0,0,0.2))'
                            }}
                        />

                        <div style={{ background: '#a3e635', border: '4px solid #1e3a8a', borderRadius: '15px', padding: '25px', minHeight: '300px' }}>
                            {data.experience?.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ fontSize: '22px', color: '#1e3a8a', lineHeight: '1.2' }}>{exp.role}</div>
                                    <div style={{ fontSize: '18px', color: '#3f6212', marginBottom: '5px' }}>{exp.company}</div>
                                    <div style={{ fontSize: '16px', color: '#4d7c0f' }}>{exp.years}</div>
                                    <p style={{ fontSize: '16px', color: '#111827', marginTop: '5px', lineHeight: '1.2' }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* SKILLS Box overlay */}
                        <div style={{ position: 'absolute', bottom: '-10px', left: '20px', background: '#93c5fd', border: '3px solid #1e3a8a', padding: '5px 20px', borderRadius: '15px', fontSize: '24px', color: '#1e3a8a' }}>
                            SKILLS
                        </div>

                        {/* Fake Progress Bars */}
                        <div style={{ marginTop: '40px', paddingLeft: '20px' }}>
                            {['Creatividad', 'Trabajo en Equipo', 'Resolución', 'Liderazgo'].map((skill, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ width: '100px', fontSize: '16px', color: '#1e3a8a' }}>{skill}</span>
                                    <div style={{ flex: 1, height: '12px', background: '#cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div style={{ width: `${80 - (i * 10)}%`, height: '100%', background: ['#4f46e5', '#f43f5e', '#10b981', '#1e293b'][i] }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProEditorialTemplate({ data }) {
    const mainFont = '"Helvetica Neue", Helvetica, Arial, sans-serif';
    return (
        <div className="cv-paper" style={{
            width: '210mm', minHeight: '297mm', background: '#e5e7eb', // Magazine gray
            padding: '40px', boxSizing: 'border-box', fontFamily: mainFont, position: 'relative',
            color: '#1f2937', display: 'flex', flexDirection: 'column'
        }}>
            {/* Header: Small Contact Info & Giant "RESUME" */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                <div>
                    <div>@REALPORTFOLIO</div>
                    <div style={{ color: '#6b7280' }}>[{data.personalInfo?.name || "AVERY DAVIS"}]</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div>PHONE</div>
                    <div style={{ color: '#6b7280' }}>[{data.personalInfo?.phone || "+123-456-7890"}]</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div>ADDRESS</div>
                    <div style={{ color: '#6b7280' }}>[{data.personalInfo?.address || "ANYWHERE ST, CITY"}]</div>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <h1 style={{
                    fontSize: '110px', fontWeight: '900', margin: '-20px 0 0 0', lineHeight: '1',
                    color: '#374151', textTransform: 'uppercase', letterSpacing: '-2px'
                }}>
                    RESUME
                </h1>
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', marginTop: '10px' }}>
                    <span>[{data.personalInfo?.title || "GRAPHIC DESIGNER"}]</span>
                    <span>[{data.personalInfo?.name || "AVERY DAVIS"}]</span>
                </div>
            </div>

            {/* Top Split: Text & Photo */}
            <div style={{ display: 'flex', gap: '40px', marginTop: '40px' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', lineHeight: '1.6', textTransform: 'uppercase', fontWeight: '500', color: '#4b5563', textAlign: 'justify' }}>
                        {data.summary || "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. NULLAM PHARETRA IN LOREM AT LAOREET. DONEC HENDRERIT LIBERO EGET EST TEMPOR."}
                    </p>
                </div>
                <div style={{ width: '45%' }}>
                    {data.personalInfo?.photo ? (
                        <img src={data.personalInfo.photo} alt="Profile" style={{ width: '100%', height: '280px', objectFit: 'cover', filter: 'grayscale(100%) contrast(1.2)' }} />
                    ) : (
                        <div style={{ width: '100%', height: '280px', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>NO PHOTO</div>
                    )}
                </div>
            </div>

            {/* Bottom Split: 2 Columns */}
            <div style={{ display: 'flex', gap: '40px', marginTop: '50px', flex: 1 }}>

                {/* Left Column */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 20px 0', color: '#374151' }}>WORK EXPERIENCE</h2>
                    {data.experience?.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}>
                                <span>{exp.company}</span>
                                <span style={{ color: '#4b5563', fontStyle: 'italic' }}>{exp.years}</span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic', marginBottom: '10px' }}>&mdash;&gt; {exp.role}</div>
                            <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#4b5563' }}>{exp.description}</p>
                        </div>
                    ))}

                    <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: '40px 0 20px 0', color: '#374151' }}>LANGUAGES</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ width: '80px', fontWeight: 'bold' }}>English</span>
                            <div style={{ display: 'flex', gap: '5px' }}>{[1, 2, 3, 4, 5].map(n => <div key={n} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#374151' }}></div>)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ width: '80px', fontWeight: 'bold' }}>Spanish</span>
                            <div style={{ display: 'flex', gap: '5px' }}>{[1, 2, 3, 4, 5].map(n => <div key={n} style={{ width: '12px', height: '12px', borderRadius: '50%', background: n <= 4 ? '#374151' : 'transparent', border: '2px solid #374151', boxSizing: 'border-box' }}></div>)}</div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 20px 0', color: '#374151' }}>EDUCATION</h2>
                    {data.education?.map((edu, i) => (
                        <div key={i} style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>{edu.school}</div>
                                <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>&mdash;&gt; {edu.degree}</div>
                            </div>
                            <div style={{ width: '80px', fontSize: '13px', color: '#4b5563', fontStyle: 'italic', textAlign: 'right' }}>{edu.year}</div>
                        </div>
                    ))}

                    <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: '40px 0 20px 0', color: '#374151' }}>SKILLS</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {['Typography', 'Photography', 'Time Management', 'Digital Illustration', 'Motion Graphic'].map((skill, i) => (
                            <div key={i} style={{
                                padding: '8px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold',
                                background: i % 2 === 0 ? '#374151' : 'transparent',
                                color: i % 2 === 0 ? 'white' : '#374151',
                                border: '2px solid #374151'
                            }}>
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Giant Name at Bottom */}
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '40px' }}>
                <div style={{ fontSize: '90px', fontWeight: '900', color: '#374151', lineHeight: '0.8', textTransform: 'uppercase', letterSpacing: '-2px' }}>
                    {data.personalInfo?.name ? data.personalInfo.name.split(' ')[0] : "AVERY"}
                </div>
                <div style={{ fontSize: '90px', fontWeight: '900', color: '#374151', lineHeight: '0.8', textTransform: 'uppercase', letterSpacing: '-2px' }}>
                    {data.personalInfo?.name ? data.personalInfo.name.split(' ').slice(1).join(' ') : "DAVIS"}
                </div>
            </div>

        </div>
    );
}

function ProDarkTemplate({ data }) {
    const mainFont = '"Inter", sans-serif';
    const gold = '#fbbf24';
    const bg = '#111827';

    return (
        <div className="cv-paper" style={{
            width: '210mm', minHeight: '297mm', background: bg,
            padding: '0', boxSizing: 'border-box', fontFamily: mainFont, color: '#f3f4f6',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* Header / Intro */}
            <div style={{ padding: '60px 40px', background: '#1f2937', textAlign: 'center', borderBottom: `4px solid ${gold}` }}>
                {data.personalInfo?.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" style={{
                        width: '150px', height: '150px', borderRadius: '50%',
                        border: `4px solid ${gold}`, marginBottom: '20px', objectFit: 'cover'
                    }} />
                )}
                <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0', color: gold, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {data.personalInfo?.name || "DANI MARTINEZ"}
                </h1>
                <h3 style={{ fontSize: '20px', fontWeight: '400', margin: '10px 0', color: '#9ca3af' }}>
                    {data.personalInfo?.title || "WEB DESIGNER"}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px', fontSize: '14px', color: '#d1d5db' }}>
                    <span>{data.personalInfo?.phone || "123-456-7890"}</span>
                    <span>{data.personalInfo?.email || "hola@web.com"}</span>
                    <span>{data.personalInfo?.address || "Madrid, ES"}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left Sidebar */}
                <div style={{ width: '35%', background: '#111827', padding: '40px', borderRight: '1px solid #374151' }}>
                    <h2 style={{ fontSize: '18px', color: gold, textTransform: 'uppercase', marginBottom: '20px', borderBottom: `1px solid ${gold}`, paddingBottom: '5px' }}>SKILLS</h2>
                    {['Programming', 'Drawing', 'Copywrite', 'Design'].map((skill, i) => (
                        <div key={i} style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '14px' }}>{skill}</span>
                                <span style={{ fontSize: '14px', color: gold }}>{90 - i * 5}%</span>
                            </div>
                            <div style={{ height: '4px', background: '#374151', borderRadius: '2px' }}>
                                <div style={{ height: '100%', background: gold, width: `${90 - i * 5}%`, borderRadius: '2px' }}></div>
                            </div>
                        </div>
                    ))}

                    <h2 style={{ fontSize: '18px', color: gold, textTransform: 'uppercase', marginTop: '60px', marginBottom: '20px', borderBottom: `1px solid ${gold}`, paddingBottom: '5px' }}>EDUCATION</h2>
                    {data.education?.map((edu, i) => (
                        <div key={i} style={{ marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{edu.degree}</div>
                            <div style={{ fontSize: '13px', color: '#9ca3af' }}>{edu.school}</div>
                            <div style={{ fontSize: '12px', color: gold, marginTop: '2px' }}>{edu.year}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '40px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '20px', color: gold, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '30px', height: '2px', background: gold }}></span> PERFIL
                        </h2>
                        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#d1d5db' }}>
                            {data.summary || "I am a creative Web Designer. I have design experience web page, banner, advertisement, graphics, and animation."}
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '20px', color: gold, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '30px', height: '2px', background: gold }}></span> EXPERIENCIA</h2>
                        {data.experience?.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '30px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #374151' }}>
                                <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: gold }}></div>
                                <div style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '2px' }}>{exp.role}</div>
                                <div style={{ fontSize: '14px', color: gold, marginBottom: '5px' }}>{exp.company} | {exp.years}</div>
                                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#9ca3af' }}>{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProBorderTemplate({ data }) {
    const mainFont = '"Inter", sans-serif';
    const blue = '#2563eb';

    return (
        <div className="cv-paper" style={{
            width: '210mm', minHeight: '297mm', background: '#f8fafc',
            border: `20px solid ${blue}`, boxSizing: 'border-box', fontFamily: mainFont,
            display: 'flex', flexDirection: 'column', position: 'relative'
        }}>
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left Side: Photo area & Main sidebar */}
                <div style={{ width: '300px', padding: '40px', borderRight: '1px solid #e2e8f0' }}>
                    {data.personalInfo?.photo && (
                        <img src={data.personalInfo.photo} alt="Profile" style={{
                            width: '220px', height: '280px', objectFit: 'cover',
                            marginBottom: '40px', border: `8px solid white`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }} />
                    )}

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '22px', color: blue, fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px' }}>About Me</h2>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
                            {data.summary || "Professional with experience in graphic design and illustration..."}
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '22px', color: blue, fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px' }}>Language</h2>
                        {['English', 'Spanish'].map((lang, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>{lang}</div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: blue, width: i === 0 ? '90%' : '80%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h2 style={{ fontSize: '22px', color: blue, fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px' }}>Skills</h2>
                        <ul style={{ paddingLeft: '15px', color: blue, fontSize: '15px', fontWeight: 'bold' }}>
                            {['Graphic Design', 'Illustration', 'Photography', 'Art Direction'].map((s, i) => (
                                <li key={i} style={{ marginBottom: '10px' }}><span style={{ color: '#475569' }}>{s}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Side: Header & Work/Education */}
                <div style={{ flex: 1, padding: '40px' }}>
                    <div style={{ borderBottom: `2px solid ${blue}`, paddingBottom: '30px', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', color: blue, margin: '0', textTransform: 'uppercase', lineHeight: '1' }}>
                            {data.personalInfo?.name || "ESTELLE DARCY"}
                        </h1>
                        <h2 style={{ fontSize: '24px', fontWeight: '400', color: blue, margin: '15px 0 0 0' }}>
                            {data.personalInfo?.title || "GRAPHIC DESIGNER"}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '25px', color: blue, fontSize: '14px', fontWeight: 'bold' }}>
                            <span>{data.personalInfo?.phone || "+123-456-7890"}</span>
                            <span>{data.personalInfo?.email || "hello@site.com"}</span>
                            <span>{data.personalInfo?.address || "123 Anywhere, City"}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '22px', color: blue, fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Education</h2>
                        {data.education?.map((edu, i) => (
                            <div key={i} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: '900', fontSize: '16px', color: blue }}>{edu.year} | {edu.degree}</span>
                                </div>
                                <div style={{ fontSize: '15px', color: '#475569' }}>{edu.school}</div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h2 style={{ fontSize: '22px', color: blue, fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Work Experience</h2>
                        {data.experience?.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '900', fontSize: '16px', color: blue }}>{exp.years} | {exp.role}</span>
                                </div>
                                <div style={{ fontSize: '15px', color: '#111', fontWeight: 'bold', marginBottom: '10px' }}>{exp.company}</div>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// === CENTRAL SWITCHER CON AUTO-SCALING ===
function CVPreview({ data, template = 'modern' }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const calculateScale = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement;
            if (!parent) return;

            // Target width for A4 at 96 DPI is exactly 794px.
            const targetWidth = 794;
            const availableWidth = parent.clientWidth - 40;

            if (availableWidth < targetWidth) {
                setScale(availableWidth / targetWidth);
            } else {
                setScale(1);
            }
        };

        // Escuchar cambios de tamaño
        const observer = new ResizeObserver(calculateScale);
        if (containerRef.current?.parentElement) {
            observer.observe(containerRef.current.parentElement);
        }

        calculateScale();
        window.addEventListener('resize', calculateScale);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', calculateScale);
        };
    }, []);

    const renderTemplate = () => {
        switch (template) {
            case 'pro-editorial':
                return <ProEditorialTemplate data={data} />;
            case 'pro-dark':
                return <ProDarkTemplate data={data} />;
            case 'pro-border':
                return <ProBorderTemplate data={data} />;
            case 'pro-y2k':
                return <ProY2KTemplate data={data} />;
            default:
                return <LegacyTemplate data={data} template={template} />;
        }
    };

    return (
        <div ref={containerRef} className="no-scrollbar" style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '100%',
            overflowX: 'hidden',
            paddingBottom: '60px' // Espacio para la sombra inferior
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
                display: 'inline-block',
                width: '210mm',
                height: '297mm',
                // Sombra realista y borde suave para definir el papel
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                backgroundColor: 'white',
                marginBottom: `calc((297mm * ${scale}) - 297mm)`
            }}>
                {renderTemplate()}
            </div>
        </div>
    );
}

export default CVPreview;
