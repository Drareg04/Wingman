import React, { useState } from 'react';
import './App.css';
import { storageService } from './services/storage';

// Component Imports
import Dashboard from './components/dashboard/Dashboard';
import CVManager from './components/cv/CVManager';
import CVEditor from './components/cv/CVEditor';
import Navbar from './components/common/Navbar';

import AuthModal from './components/common/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  const [step, setStep] = useState('dashboard');
  const [isGuest, setIsGuest] = useState(false); // New Guest State

  // Global Selection State
  const [activeCVId, setActiveCVId] = useState(null); // Track selected CV

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false); // New Dark Mode State
  const [showAuthModal, setShowAuthModal] = useState(false); // Auth Modal State
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  // Navigation Handlers
  const goDashboard = () => setStep('dashboard');

  const handleSelectMode = (mode) => {
    if (mode === 'jobs') {
      // Do nothing
    } else if (mode === 'create-cv') {
      setStep('cv-manager');
    } else if (mode === 'interview' || mode === 'voice') {
      // Do nothing
    } else if (mode === 'cv-fix') {
      // Do nothing
    } else if (mode === 'dashboard') {
      setStep('dashboard');
    } else if (mode === 'upgrade') {
      // Do nothing
    }
  };



  const handleGuestLogin = () => {
    setIsGuest(true);
    setStep('dashboard');
  };
  const handleSelectCV = (cvId) => {
    setActiveCVId(cvId);
    setStep('cv-editor');
  };
  return (
    <AuthProvider>
      <div className={`app-wrapper ${isDarkMode ? 'dark-mode' : ''}`} style={{ minHeight: '100vh', width: '100%' }}>

        {/* Auth Modal overlay for Login/Register */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
        />


        <div className="sky-container">
          {/* Background Clouds */}
          <div className="bg-cloud c1"></div>
          <div className="bg-cloud c2"></div>

          {/* Moon for Night Mode */}
          <div className={`moon ${isDarkMode ? 'visible' : ''}`}></div>

          {/* Flying Dove / Bat */}
          <div className={`flying-dove ${isDarkMode ? 'bat' : ''}`} style={{
            '--bg-1': isDarkMode ? "url('/mur1.png')" : "url('/volando1.png')",
            '--bg-2': isDarkMode ? "url('/mur2.png')" : "url('/volando2.png')",
            '--bg-3': isDarkMode ? "url('/mur3.png')" : "url('/volando3.png')"
          }}>
            {!isDarkMode && <div className="dove-drop" style={{ backgroundImage: "url('/cagada.png')" }} />}
          </div>
        </div>

        {/* Navbar moved outside of constrained app-content to span full width */}
        <Navbar
          onNavigate={handleSelectMode}

          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenAuth={openAuthModal}
          onOpenProfile={() => alert('¡El perfil de usuario estará disponible próximamente!')}
          isGuest={isGuest}
        />

        <div className="app-content">

          {step === 'dashboard' && (
            <DashboardWrapper
              onSelectMode={handleSelectMode}
              isGuest={isGuest}
              onGuestLogin={handleGuestLogin}
              onOpenAuth={openAuthModal}
            />
          )}

          {/* Oculto en Sprint 1
          {step === 'jobs' && (
            <JobBoard
              onSelectOffer={handleSelectOffer}
              onBack={goDashboard}
            />
          )}
          */}

          {step === 'cv-manager' && (
            <CVManager
              onSelectCV={handleSelectCV}
              onBack={goDashboard}
            />
          )}

          {step === 'cv-editor' && (
            <CVEditor
              cvId={activeCVId}
              onBack={() => setStep('cv-manager')} // Back goes to Manager, not Dashboard
            />
          )}

          {/* Oculto en Sprint 1
          {step === 'interview' && (
            <InterviewMode
              cvText={storageService.getCVString()}
              activeOffer={activeOffer}
              onClearOffer={() => setActiveOffer(null)}
              initialMode={interviewMode}
              onBack={goDashboard}
            />
          )}

          {step === 'upgrade' && (
            <UpgradePlan onBack={goDashboard} />
          )}
          */}

        </div>
      </div>
    </AuthProvider>
  );
}

// Helper to decide view based on Auth
function DashboardWrapper({ onSelectMode, isGuest, onGuestLogin, onOpenAuth }) {
  const { currentUser } = useAuth();

  // Always show Dashboard, bypassing Landing Page. Auth is handled by Navbar
  return <Dashboard onSelectMode={onSelectMode} />;
}

export default App;