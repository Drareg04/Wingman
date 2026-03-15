import React, { useState } from 'react';
import './Dashboard.css';
import { MessageCircle, Mic, Sparkles, FolderOpen, FileEdit, HelpCircle } from 'lucide-react';

const FEATURES = [
  {
    id: 'create-cv',
    icon: <FileEdit size={30} />,
    title: 'Editor CV',
    desc: 'Nuevo Generador\nProfesional (Hi-Fi)',
    active: true,
    floatDuration: '5.5s',
    floatDelay: '0s',
    colorClass: 'card-purple',
    tag: 'DISPONIBLE',
    tagColor: '#16a34a',
    tagBg: '#dcfce7',
  },
  {
    id: 'create-cv-questions',
    icon: <HelpCircle size={30} />,
    title: 'CV Guiado',
    desc: 'Crea tu currículum\ncon ayuda de IA',
    active: true,
    floatDuration: '6.2s',
    floatDelay: '0.3s',
    colorClass: 'card-cyan',
    tag: 'DISPONIBLE',
    tagColor: '#16a34a',
    tagBg: '#dcfce7',
  },
  {
    id: 'interview',
    icon: <MessageCircle size={30} />,
    title: 'Entrevista',
    desc: 'Practica entrevistas\nreales en chat',
    active: true,
    floatDuration: '6.5s',
    floatDelay: '0.4s',
    colorClass: 'card-blue',
    tag: 'DISPONIBLE',
    tagColor: '#16a34a',
    tagBg: '#dcfce7',
  },
  {
    id: 'voice',
    icon: <Mic size={30} />,
    title: 'Modo Voz',
    desc: 'Simula entrevistas\nhablando en vivo',
    active: false,
    floatDuration: '7s',
    floatDelay: '0.8s',
    colorClass: 'card-pink',
    tag: 'PRONTO',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
  },
  {
    id: 'cv-fix',
    icon: <Sparkles size={30} />,
    title: 'Mejora CV',
    desc: 'Revisión IA de\ntu currículum',
    active: false,
    floatDuration: '6s',
    floatDelay: '0.2s',
    colorClass: 'card-green',
    tag: 'PRONTO',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
  },
  {
    id: 'jobs',
    icon: <FolderOpen size={30} />,
    title: 'Ofertas',
    desc: 'Busca y gestiona\ntus empleos',
    active: false,
    floatDuration: '5.8s',
    floatDelay: '1.2s',
    colorClass: 'card-orange',
    tag: 'PRONTO',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
  },
];

function CloudCard({ feature, onAction }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      className={`cloud-card ${feature.colorClass} ${!feature.active ? 'cloud-card-dim' : ''}`}
      style={{
        animationDuration: feature.floatDuration,
        animationDelay: feature.floatDelay,
        cursor: feature.active ? 'pointer' : 'default',
      }}
      onMouseDown={() => feature.active && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={() => feature.active && onAction(feature.id)}
    >
      {/* Cloud image as background — inline so CRA doesn't resolve as module */}
      <div className="cloud-card-bg" style={{ backgroundImage: "url('/nube.png')" }} />

      {/* Content sits on top of cloud */}
      <div className="cloud-card-content">
        {/* Tag badge */}
        <div
          className="cloud-card-tag"
          style={{ color: feature.tagColor, background: feature.tagBg, borderColor: feature.tagColor }}
        >
          {feature.tag}
        </div>

        {/* Icon */}
        <div className="cloud-card-icon">
          {feature.icon}
        </div>

        <div className="cloud-card-title">{feature.title}</div>
        <div className="cloud-card-desc">{feature.desc}</div>

        {feature.active ? (
          <div className={`cloud-card-cta ${pressed ? 'cloud-card-cta-pressed' : ''}`}>
            [EJECUTAR]
          </div>
        ) : (
          <div className="cloud-card-cta" style={{ background: '#94a3b8', fontSize: '0.9rem' }}>
            BLOQUEADO
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ onSelectMode }) {
  return (
    <div className="px-dashboard">

      {/* ── HERO ── */}
      <div className="px-hero">
        <div className="px-hero-badge">
          <span className="px-blink">▶</span> WINGMAN OS v2.0 <span className="px-blink">◀</span>
        </div>

        <h1 className="px-hero-title">
          WINGMAN
          <span className="px-cursor">_</span>
        </h1>

        <p className="px-hero-sub">
          Tu centro de mando IA para dominar el mercado laboral.<br />
          Optimiza tu carrera con las herramientas más potentes.
        </p>

        <div className="px-hero-divider">
          {'═'.repeat(40)}
        </div>

        {/* Stats row */}
        <div className="px-stats">
          <div className="px-stat">
            <span className="px-stat-val">100%</span>
            <span className="px-stat-lbl">FREE-TO-PLAY</span>
          </div>
          <div className="px-stat-sep">│</div>
          <div className="px-stat">
            <span className="px-stat-val">NEW</span>
            <span className="px-stat-lbl">IA-DRIVEN</span>
          </div>
          <div className="px-stat-sep">│</div>
          <div className="px-stat">
            <span className="px-stat-val">TOP</span>
            <span className="px-stat-lbl">CARGO-RANK</span>
          </div>
        </div>
      </div>

      {/* ── SECTION HEADER ── */}
      <div className="px-section-header">
        <span>┌─</span>
        <span className="px-section-title">SELECCIONA MÓDULO</span>
        <span>─┐</span>
      </div>

      {/* ── CLOUD CARDS GRID ── */}
      <div className="cloud-cards-grid">
        {FEATURES.map((feature) => (
          <CloudCard
            key={feature.id}
            feature={feature}
            onAction={onSelectMode}
          />
        ))}
      </div>

      <div className="px-section-footer">
        <span>└{'─'.repeat(40)}┘</span>
      </div>

    </div>
  );
}
