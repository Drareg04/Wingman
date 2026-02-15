import React, { useState } from 'react';
import './App.css';
import { storageService } from './services/storage';

// Component Imports
import Dashboard from './components/dashboard/Dashboard';
import JobBoard from './components/jobs/JobBoard';
import CVEditor from './components/cv/CVEditor';
import InterviewMode from './components/interview/InterviewMode';

function App() {
  const [step, setStep] = useState('dashboard');
  const [interviewMode, setInterviewMode] = useState('chat'); // 'chat' or 'voice'

  // Global Selection State
  const [activeOffer, setActiveOffer] = useState(null);

  // Navigation Handlers
  const goDashboard = () => setStep('dashboard');

  const handleSelectMode = (mode) => {
    if (mode === 'jobs') {
      setStep('jobs');
    } else if (mode === 'create-cv') {
      setStep('cv-editor');
    } else if (mode === 'interview' || mode === 'voice') {
      // Allow entry even without activeOffer (Generic Mode)
      setInterviewMode(mode === 'voice' ? 'voice' : 'chat');
      setStep('interview');
    } else if (mode === 'cv-fix') {
      alert("Función 'Mejorar CV' integrada en el Editor próximamente. Redirigiendo al Editor...");
      setStep('cv-editor');
    }
  };

  const handleSelectOffer = (offer) => {
    setActiveOffer(offer);
    const proceed = window.confirm(`Oferta seleccionada: ${offer.title}\n¿Quieres empezar la entrevista ahora?`);
    if (proceed) {
      setInterviewMode('chat');
      setStep('interview');
    } else {
      setStep('dashboard');
    }
  };

  return (
    <>
      <div className="sky-container"><div className="bg-cloud c1"></div><div className="bg-cloud c2"></div></div>

      <div className="app-content">
        <header className="pixel-header">
          <img src="/paloma.gif" alt="Wingman" className="header-gif" />
          <h1 className="header-title">WINGMAN</h1>
        </header>

        {step === 'dashboard' && (
          <Dashboard onSelectMode={handleSelectMode} />
        )}

        {step === 'jobs' && (
          <JobBoard
            onSelectOffer={handleSelectOffer}
            onBack={goDashboard}
          />
        )}

        {step === 'cv-editor' && (
          <CVEditor
            onBack={goDashboard}
          />
        )}

        {step === 'interview' && (
          <InterviewMode
            cvText={storageService.getCVString()}
            activeOffer={activeOffer}
            onClearOffer={() => setActiveOffer(null)}
            initialMode={interviewMode}
            onBack={goDashboard}
          />
        )}

      </div>
    </>
  );
}

export default App;