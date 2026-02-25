import React from 'react';
import '../../App.css';
import { MessageCircle, Mic, Sparkles, FolderOpen, FileEdit } from 'lucide-react';

function CloudButton({ id, icon, title, desc, mode, floatClass, tourClass, backgroundImage, onAction }) {
    const handleClick = () => {
        onAction(mode);
    };

    return (
        <div
            className={`cloud-btn ${floatClass} ${tourClass}`}
            onClick={handleClick}
            style={{ backgroundImage }}
        >
            <span className="cloud-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                {icon}
            </span>
            <div className="cloud-title" style={{ position: 'relative', zIndex: 1 }}>{title}</div>
            <div className="cloud-desc" style={{ position: 'relative', zIndex: 1 }}>{desc}</div>
        </div>
    );
}

export default function Dashboard({ onSelectMode }) {

    return (
        <div className="clouds-dashboard">

            <CloudButton
                id="cloud-1"
                mode="interview"
                title="Entrevista"
                desc="Chat Texto"
                icon={<MessageCircle size={36} color="#1e3a8a" />}
                floatClass="float-1"
                tourClass="tour-interview"
                backgroundImage="url('/nube.png')"
                onAction={onSelectMode}
            />

            <CloudButton
                id="cloud-2"
                mode="voice"
                title="Modo Voz"
                desc="Hablar en vivo"
                icon={<Mic size={36} color="#1e3a8a" />}
                floatClass="float-3"
                tourClass="tour-voice"
                backgroundImage="url('/nube.png')"
                onAction={onSelectMode}
            />

            <CloudButton
                id="cloud-3"
                mode="cv-fix"
                title="Mejorar CV"
                desc="Revisión IA"
                icon={<Sparkles size={36} color="#1e3a8a" />}
                floatClass="float-2"
                tourClass="tour-cv-fix"
                backgroundImage="url('/nube.png')"
                onAction={() => { }}
            />

            <CloudButton
                id="cloud-4"
                mode="jobs"
                title="Ofertas"
                desc="Gestión"
                icon={<FolderOpen size={36} color="#1e3a8a" />}
                floatClass="float-4"
                tourClass="tour-jobs"
                backgroundImage="url('/nube.png')"
                onAction={() => { }}
            />

            <CloudButton
                id="cloud-5"
                mode="create-cv"
                title="Editor CV"
                desc="Nuevo (Hi-Fi)"
                icon={<FileEdit size={36} color="#1e3a8a" />}
                floatClass="float-1"
                tourClass="tour-create-cv"
                backgroundImage="url('/nube.png')"
                onAction={onSelectMode}
            />
        </div>
    );
}
