import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { getCVMatchAnalysis } from '../../services/ai';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Plus, Trash2, Search, X, Linkedin } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'Pendiente', label: '📋 Pendiente', bg: '#fef3c7', color: '#b45309' },
    { value: 'Aplicada', label: '📨 Aplicada', bg: '#dbeafe', color: '#1e40af' },
    { value: 'Entrevista', label: '🎤 Entrevista', bg: '#dcfce7', color: '#16a34a' },
    { value: 'Rechazada', label: '❌ Rechazada', bg: '#fee2e2', color: '#dc2626' },
    { value: 'Aceptada', label: '🎉 Aceptada', bg: '#d1fae5', color: '#059669' },
];

function MatchModal({ isOpen, onClose, analysis, loading, jobTitle }) {
    if (!isOpen) return null;

    const getColor = (pct) => {
        if (pct >= 75) return '#16a34a';
        if (pct >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '40px',
                width: '100%', maxWidth: '600px', position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)', maxHeight: '85vh', overflowY: 'auto'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '15px', right: '15px',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '2rem', marginTop: 0, color: '#1e3a8a' }}>
                    🔍 ANÁLISIS MATCH IA
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
                    Compatibilidad de tu CV con: <strong>{jobTitle}</strong>
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#3b82f6', fontSize: '1.2rem' }}>
                        Analizando compatibilidad con IA... ⏳
                    </div>
                ) : analysis ? (
                    <>
                        {/* Match Circle */}
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                border: `8px solid ${getColor(analysis.matchPercent)}`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto', background: '#f8fafc'
                            }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: getColor(analysis.matchPercent) }}>
                                    {analysis.matchPercent}%
                                </span>
                            </div>
                            <div style={{
                                display: 'inline-block', marginTop: '10px',
                                padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold',
                                background: getColor(analysis.matchPercent) + '20', color: getColor(analysis.matchPercent)
                            }}>
                                {analysis.verdict}
                            </div>
                        </div>

                        {/* Summary */}
                        <p style={{ color: '#475569', lineHeight: '1.6', background: '#f8fafc', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
                            {analysis.summary}
                        </p>

                        {/* Strengths */}
                        {analysis.strengths?.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#16a34a', marginBottom: '10px' }}>✅ Puntos Fuertes</h4>
                                {analysis.strengths.map((s, i) => (
                                    <div key={i} style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '5px', fontSize: '0.9rem', color: '#166534' }}>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Gaps */}
                        {analysis.gaps?.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#dc2626', marginBottom: '10px' }}>⚠️ Carencias</h4>
                                {analysis.gaps.map((g, i) => (
                                    <div key={i} style={{ padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', marginBottom: '5px', fontSize: '0.9rem', color: '#991b1b' }}>
                                        {g}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Suggestions */}
                        {analysis.suggestions?.length > 0 && (
                            <div>
                                <h4 style={{ color: '#2563eb', marginBottom: '10px' }}>💡 Sugerencias</h4>
                                {analysis.suggestions.map((s, i) => (
                                    <div key={i} style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: '8px', marginBottom: '5px', fontSize: '0.9rem', color: '#1e40af' }}>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p style={{ color: '#ef4444' }}>No se pudo generar el análisis.</p>
                )}
            </div>
        </div>
    );
}

function JobBoard({ onSelectOffer, onBack }) {
    const { currentUser } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', company: '', description: '' });
    const [matchModal, setMatchModal] = useState({ open: false, analysis: null, loading: false, title: '' });

    useEffect(() => {
        setJobs(storageService.getJobs(currentUser));
    }, [currentUser]);

    const handleAddJob = () => {
        if (!newJob.title || !newJob.company) return;
        const added = storageService.addJob(newJob, currentUser);
        setJobs(prev => [...prev, added]);
        setShowForm(false);
        setNewJob({ title: '', company: '', description: '' });
    };

    const handleDeleteJob = (id) => {
        if (!window.confirm('¿Eliminar esta oferta?')) return;
        const updated = jobs.filter(j => j.id !== id);
        setJobs(updated);
        const key = `wingman_jobs_${(currentUser || { uid: 'guest123' }).uid}`;
        localStorage.setItem(key, JSON.stringify(updated));
    };

    const handleStatusChange = (id, newStatus) => {
        storageService.updateJobStatus(id, newStatus, currentUser);
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j));
    };

    const handleMatchAnalysis = async (job) => {
        setMatchModal({ open: true, analysis: null, loading: true, title: `${job.title} @ ${job.company}` });
        const cvText = storageService.getCVString(currentUser);
        const offerText = `PUESTO: ${job.title}\nEMPRESA: ${job.company}\nDESCRIPCIÓN: ${job.description}`;
        const result = await getCVMatchAnalysis(cvText, offerText);
        setMatchModal(prev => ({ ...prev, analysis: result, loading: false }));
    };

    const handleShareLinkedIn = (job) => {
        const text = `🔍 Interesado en la posición de ${job.title} en ${job.company}. ${job.description ? job.description.substring(0, 100) + '...' : ''} #empleo #trabajo`;
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://github.com/Drareg04/Wingman')}&summary=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const getStatusStyle = (status) => {
        const found = STATUS_OPTIONS.find(s => s.value === status);
        return found ? { background: found.bg, color: found.color } : { background: '#f1f5f9', color: '#64748b' };
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <MatchModal
                isOpen={matchModal.open}
                onClose={() => setMatchModal({ open: false, analysis: null, loading: false, title: '' })}
                analysis={matchModal.analysis}
                loading={matchModal.loading}
                jobTitle={matchModal.title}
            />

            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '30px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '20px'
            }}>
                <button onClick={onBack} className="btn-back" style={{ position: 'static', margin: 0, transform: 'none' }}>
                    ⬅ Volver
                </button>
                <h2 style={{
                    margin: 0, fontSize: '2.5rem', fontFamily: "'VT323', monospace",
                    color: 'white', textShadow: '2px 2px 0px rgba(0,0,0,0.2)'
                }}>
                    <Briefcase size={28} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                    GESTIÓN DE OFERTAS
                </h2>
                <button onClick={() => setShowForm(!showForm)} style={{
                    background: showForm ? '#ef4444' : '#3b82f6', color: 'white', border: 'none',
                    borderBottom: `4px solid ${showForm ? '#b91c1c' : '#1e40af'}`,
                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
                    fontSize: '1rem', fontFamily: "'VT323', monospace", display: 'flex', alignItems: 'center', gap: '5px'
                }}>
                    {showForm ? <><X size={18} /> CANCELAR</> : <><Plus size={18} /> NUEVA OFERTA</>}
                </button>
            </div>

            {/* New Job Form */}
            {showForm && (
                <div style={{
                    background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px',
                    marginBottom: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '2px solid #e2e8f0'
                }}>
                    <h3 style={{ marginTop: 0, color: '#1e293b', fontFamily: "'VT323', monospace", fontSize: '1.5rem' }}>
                        📝 Nueva Oferta de Trabajo
                    </h3>
                    <input
                        type="text" placeholder="Título del puesto (ej. Frontend Developer)"
                        value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                    <input
                        type="text" placeholder="Empresa"
                        value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                    <textarea
                        placeholder="Pega aquí la descripción completa de la oferta de trabajo..."
                        value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                        style={{ width: '100%', minHeight: '120px', resize: 'vertical', marginBottom: '10px' }}
                    />
                    <button onClick={handleAddJob} style={{
                        background: '#16a34a', color: 'white', border: 'none',
                        borderBottom: '4px solid #15803d', padding: '12px 30px', borderRadius: '10px',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: "'VT323', monospace"
                    }}>
                        ✅ GUARDAR OFERTA
                    </button>
                </div>
            )}

            {/* Jobs Grid */}
            {jobs.length === 0 ? (
                <div style={{
                    textAlign: 'center', color: 'white', padding: '60px 40px',
                    background: 'rgba(255,255,255,0.1)', borderRadius: '20px',
                    border: '2px dashed rgba(255,255,255,0.3)'
                }}>
                    <Briefcase size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
                    <h3 style={{ fontFamily: "'VT323', monospace", fontSize: '1.8rem' }}>No hay ofertas guardadas</h3>
                    <p style={{ opacity: 0.7 }}>Añade ofertas de empleo para practicar entrevistas y analizar tu compatibilidad con IA.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
                    {jobs.map(job => (
                        <div key={job.id} style={{
                            background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '25px',
                            border: '2px solid #e2e8f0', transition: 'all 0.3s', position: 'relative',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            display: 'flex', flexDirection: 'column', gap: '12px'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; }}
                        >
                            {/* Delete button */}
                            <button onClick={() => handleDeleteJob(job.id)} style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                                padding: '4px', borderRadius: '6px', transition: 'color 0.2s'
                            }}
                                onMouseEnter={e => e.target.style.color = '#ef4444'}
                                onMouseLeave={e => e.target.style.color = '#94a3b8'}
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* Status badge + selector */}
                            <select
                                value={job.status}
                                onChange={e => handleStatusChange(job.id, e.target.value)}
                                style={{
                                    ...getStatusStyle(job.status),
                                    border: 'none', borderRadius: '20px', padding: '5px 12px',
                                    fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer',
                                    width: 'fit-content', appearance: 'auto', outline: 'none', margin: 0
                                }}
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>

                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 'bold' }}>{job.title}</h3>
                            <p style={{ margin: 0, fontWeight: '600', color: '#3b82f6', fontSize: '0.95rem' }}>{job.company}</p>
                            {job.description && (
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4', maxHeight: '60px', overflow: 'hidden' }}>
                                    {job.description.substring(0, 120)}{job.description.length > 120 ? '...' : ''}
                                </p>
                            )}

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                                <button onClick={() => onSelectOffer(job)} style={{
                                    flex: 1, background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px',
                                    padding: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                }}>
                                    🎤 Practicar
                                </button>
                                <button onClick={() => handleMatchAnalysis(job)} style={{
                                    flex: 1, background: '#0891b2', color: 'white', border: 'none', borderRadius: '8px',
                                    padding: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                }}>
                                    <Search size={14} /> Match IA
                                </button>
                                <button onClick={() => handleShareLinkedIn(job)} style={{
                                    background: '#0a66c2', color: 'white', border: 'none', borderRadius: '8px',
                                    padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                }} title="Compartir en LinkedIn">
                                    <Linkedin size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default JobBoard;
