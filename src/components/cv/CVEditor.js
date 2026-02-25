import React, { useState, useEffect } from 'react';
import CVForm from './CVForm';
import { storageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

function CVEditor({ cvId, onBack }) {
    const { currentUser } = useAuth();
    // Load full CV object (wrapper) or default
    const [cvWrapper, setCvWrapper] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const found = await storageService.getCVById(cvId, currentUser);
            // If not found, look for any default or create empty wrapper
            if (found) {
                setCvWrapper(found);
            } else {
                const all = await storageService.getCVs(currentUser);
                setCvWrapper({ data: all[0]?.data || {} });
            }
            setLoading(false);
        };
        load();
    }, [cvId, currentUser]);

    // We work with the 'data' part, but need 'id' and 'name' for saving
    const [cvData, setCvData] = useState(null);
    const [cvName, setCvName] = useState("Mi CV");

    // Sync state when wrapper loads
    useEffect(() => {
        if (cvWrapper) {
            setCvData(cvWrapper.data || {});
            setCvName(cvWrapper.name || "Mi CV");
        }
    }, [cvWrapper]);

    const handleSave = async () => {
        if (!cvData) return;
        await storageService.saveCV(cvId, cvData, cvName, currentUser);
        alert('CV Guardado correctamente');
    };

    const handleChange = (section, field, value, index = null) => {
        setCvData(prevCoords => {
            // 1. Top-level fields (like 'summary')
            if (!section) {
                return { ...prevCoords, [field]: value };
            }

            // 2. Nested objects (like 'personalInfo')
            // If index is null, we assume we are updating a field in a section object
            if (index === null) {
                const currentSection = prevCoords[section];
                // Only proceed if it's NOT an array (because arrays are handled in case 3)
                if (!Array.isArray(currentSection)) {
                    return {
                        ...prevCoords,
                        [section]: {
                            ...(currentSection || {}), // Create if undefined/null
                            [field]: value
                        }
                    };
                }
            }

            // 3. Arrays (like 'experience' or 'education')
            if (index !== null && Array.isArray(prevCoords[section])) {
                const newArray = [...prevCoords[section]];
                newArray[index] = { ...newArray[index], [field]: value };
                return { ...prevCoords, [section]: newArray };
            }

            return prevCoords;
        });
    };

    const addItem = (section, initialItem) => {
        setCvData(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), initialItem]
        }));
    };

    const removeItem = (section, index) => {
        setCvData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    if (loading || !cvData) return <div style={{ padding: 20, color: 'white' }}>Cargando Editor Básico...</div>;

    return (
        <div className="cv-editor-container" style={{
            display: 'flex',
            justifyContent: 'center',
            height: '100vh',
            padding: '40px',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 10,
            overflowY: 'auto'
        }}>
            <div className="glass-window" style={{
                width: '600px',
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div style={{ paddingBottom: '15px', borderBottom: '2px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: '#e2e8f0', border: 'none', borderRadius: '5px' }}>⬅ Volver</button>
                    <h2 style={{ margin: 0, fontFamily: "'Nunito', sans-serif" }}>Editor CV Básico (Sprint 1)</h2>
                    <button onClick={handleSave} style={{ padding: '8px 15px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>Guardar</button>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Nombre del Documento</label>
                    <input
                        value={cvName}
                        onChange={(e) => setCvName(e.target.value)}
                        style={{
                            width: '100%', padding: '10px', border: '2px solid #ddd', borderRadius: '8px',
                            fontWeight: 'bold', boxSizing: 'border-box', marginBottom: '30px'
                        }}
                    />

                    <CVForm
                        data={cvData}
                        onChange={handleChange}
                        onAdd={addItem}
                        onRemove={removeItem}
                    />
                </div>
            </div>
        </div>
    );
}

export default CVEditor;
