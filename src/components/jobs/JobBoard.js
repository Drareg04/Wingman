import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';

function JobBoard({ onSelectOffer, onBack }) {
    const [jobs, setJobs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', company: '', description: '' });

    useEffect(() => {
        setJobs(storageService.getJobs());
    }, []);

    const handleAddJob = () => {
        if (!newJob.title || !newJob.company) return;
        const added = storageService.addJob(newJob);
        setJobs(prev => [...prev, added]);
        setShowForm(false);
        setNewJob({ title: '', company: '', description: '' });
    };

    return (
        <div className="panel-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📂 GESTIÓN DE OFERTAS (Manuel API)</h2>
                <button className="btn-pixel" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'CANCELAR' : '+ SUBIR OFERTA'}
                </button>
            </div>

            {showForm && (
                <div className="job-form" style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h4>Nueva Oferta</h4>
                    <input
                        type="text"
                        placeholder="Título (ej. React Dev)"
                        value={newJob.title}
                        onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Empresa"
                        value={newJob.company}
                        onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <textarea
                        placeholder="Descripción de la oferta..."
                        value={newJob.description}
                        onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', minHeight: '80px' }}
                    />
                    <button className="btn-pixel" onClick={handleAddJob}>GUARDAR OFERTA</button>
                </div>
            )}

            <div className="job-grid">
                {jobs.length === 0 && <p>No hay ofertas disponibles.</p>}
                {jobs.map(job => (
                    <div key={job.id} className="job-card">
                        <span className="status-badge">{job.status}</span>
                        <h3>{job.title}</h3>
                        <p style={{ fontWeight: 'bold' }}>{job.company}</p>
                        <p style={{ fontSize: '0.8rem' }}>{job.description}</p>
                        <button
                            className="btn-pixel"
                            style={{ fontSize: '0.9rem', padding: '5px 10px', marginTop: '10px' }}
                            onClick={() => onSelectOffer(job)}
                        >
                            PRACTICAR
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button className="btn-back" onClick={onBack}>⬅ VOLVER AL MENÚ</button>
            </div>
        </div>
    );
}

export default JobBoard;
