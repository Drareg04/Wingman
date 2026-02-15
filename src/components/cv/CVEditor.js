import React, { useState } from 'react';
import CVForm from './CVForm';
import CVPreview from './CVPreview';
import { storageService } from '../../services/storage';

function CVEditor({ onBack }) {
    const [cvData, setCvData] = useState(storageService.getCV());

    // Autosave effect (optional, or just on button click)
    // useEffect(() => { storageService.saveCV(cvData); }, [cvData]);

    const handleSave = () => {
        storageService.saveCV(cvData);
        alert('CV Guardado correctamente');
    };

    const handleChange = (section, field, value, index = null) => {
        setCvData(prevCoords => {
            // 1. Top-level fields (like 'summary')
            if (!section) {
                return { ...prevCoords, [field]: value };
            }

            // 2. Nested objects (like 'personalInfo')
            if (index === null && typeof prevCoords[section] === 'object' && !Array.isArray(prevCoords[section])) {
                return {
                    ...prevCoords,
                    [section]: { ...prevCoords[section], [field]: value }
                };
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

    return (
        <div className="cv-editor-container" style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            {/* Header Toolbar */}
            <div style={{ padding: '10px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={onBack} style={{ background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer' }}>⬅ Menú</button>
                <h3>EDITOR DE CV (Hi-Fi)</h3>
                <button onClick={handleSave} style={{ background: '#4ade80', color: '#000', border: 'none', padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR</button>
            </div>

            {/* Main Split View */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left: Form Sidebar */}
                <div style={{ width: '40%', minWidth: '350px', borderRight: '2px solid #ddd', overflowY: 'auto', background: '#f8fafc' }}>
                    <CVForm
                        data={cvData}
                        onChange={handleChange}
                        onAdd={addItem}
                        onRemove={removeItem}
                    />
                </div>

                {/* Right: Preview */}
                <div style={{ flex: 1, background: '#e2e8f0', padding: '20px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <CVPreview data={cvData} />
                </div>
            </div>
        </div>
    );
}

export default CVEditor;
