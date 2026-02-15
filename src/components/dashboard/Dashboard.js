import React from 'react';
import '../../App.css'; // Assuming styles are globally available for now

function Dashboard({ onSelectMode }) {
    return (
        <div className="clouds-dashboard">
            <div className="cloud-btn float-1" onClick={() => onSelectMode('interview')}>
                <span className="cloud-icon">💬</span>
                <div className="cloud-title">Entrevista</div>
                <div className="cloud-desc">Chat Texto</div>
            </div>

            <div className="cloud-btn float-3" onClick={() => onSelectMode('voice')} style={{ border: '3px solid #f97316' }}>
                <span className="cloud-icon">🎙️</span>
                <div className="cloud-title">Modo Voz</div>
                <div className="cloud-desc">Hablar en vivo</div>
            </div>

            <div className="cloud-btn float-2" onClick={() => onSelectMode('cv-fix')}>
                <span className="cloud-icon">✨</span>
                <div className="cloud-title">Mejorar CV</div>
                <div className="cloud-desc">Revisión IA</div>
            </div>

            <div className="cloud-btn float-4" onClick={() => onSelectMode('jobs')}>
                <span className="cloud-icon">📂</span>
                <div className="cloud-title">Ofertas</div>
                <div className="cloud-desc">Gestión</div>
            </div>

            <div className="cloud-btn float-1" onClick={() => onSelectMode('create-cv')}>
                <span className="cloud-icon">📝</span>
                <div className="cloud-title">Editor CV</div>
                <div className="cloud-desc">Nuevo (Hi-Fi)</div>
            </div>
        </div>
    );
}

export default Dashboard;
