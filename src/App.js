import React, { useEffect, useState } from 'react'
import './App.css'
import { storageService } from './services/storage'
import { offersService } from './services/offers'

// Component Imports
import Dashboard from './components/dashboard/Dashboard'
import CVManager from './components/cv/CVManager'
import CVEditor from './components/cv/CVEditor'
import CVQuestionnaire from './components/cv/CVQuestionnaire'
import Navbar from './components/common/Navbar'
import JobBoard from './components/jobs/JobBoard'


import AuthModal from './components/common/AuthModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProfileModal from './components/common/ProfileModal'
import TemplatePickerModal from './components/cv/TemplatePickerModal'
import InterviewMode from './components/interview/InterviewMode'

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

function AppInner() {
  const [step, setStep] = useState('dashboard')
  const [isGuest, setIsGuest] = useState(false)

  // Global Selection State
  const [activeCVId, setActiveCVId] = useState(null)
  const [activeOffer, setActiveOffer] = useState(null)

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [showProfileModal, setShowProfileModal] = useState(false)

  const { currentUser } = useAuth()

  // Lightweight route protection: if not logged in (and not guest),
  // allow dashboard only (everything else requires auth or guest mode).
  useEffect(() => {
    const isProtectedStep =
      step !== 'dashboard' && step !== 'upgrade'

    if (!currentUser && !isGuest && isProtectedStep) {
      setStep('dashboard')
    }
  }, [currentUser, isGuest, step])

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode)
    setShowAuthModal(true)
  }

  // Navigation Handlers
  const goDashboard = () => setStep('dashboard')

  const handleSelectMode = mode => {
    if (mode === 'jobs') {
      setStep('jobs')
    } else if (mode === 'create-cv') {
      setStep('cv-manager')
    } else if (mode === 'create-cv-questions') {
      setStep('cv-questions')
    } else if (mode === 'interview' || mode === 'voice') {
      setStep('interview')
    } else if (mode === 'cv-fix') {
      // Do nothing
    } else if (mode === 'dashboard') {
      setStep('dashboard')
    } else if (mode === 'upgrade') {
      // Do nothing
    }
  }

  const handleGuestLogin = () => {
    setIsGuest(true)
    setStep('dashboard')
  }
  const handleSelectCV = cvId => {
    setActiveCVId(cvId)
    setStep('cv-editor')
  }

  const handleSelectOffer = (offer) => {
    setActiveOffer(offer)
    setStep('interview')
  }

  const [pendingQuestionnaireResult, setPendingQuestionnaireResult] = useState(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [templateChoice, setTemplateChoice] = useState('modern')

  const handleFinishQuestions = async ({ cvName, answers }) => {
    setPendingQuestionnaireResult({ cvName, answers })
    setShowTemplatePicker(true)
  }

  const handleConfirmTemplate = async () => {
    if (!pendingQuestionnaireResult) return
    try {
      const { cvName, answers } = pendingQuestionnaireResult
      const newId = await storageService.createCVFromQuestions(cvName || 'Mi CV', answers, currentUser || undefined)

      const cv = await storageService.getCVById(newId, currentUser || undefined)
      if (cv?.data) {
        await storageService.saveCV(newId, { ...cv.data, template: templateChoice }, cv.name || cvName || 'Mi CV', currentUser || undefined)
      }

      setShowTemplatePicker(false)
      setPendingQuestionnaireResult(null)
      setActiveCVId(newId)
      setStep('cv-editor')
    } catch (e) {
      console.error(e)
      alert('No se pudo crear el CV.')
    }
  }

  return (
    <div className={`app-wrapper ${isDarkMode ? 'dark-mode' : ''}`} style={{ minHeight: '100vh', width: '100%' }}>
      {/* Auth Modal overlay for Login/Register */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      <div className='sky-container'>
        {/* Background Clouds */}
        <div className='bg-cloud c1'></div>
        <div className='bg-cloud c2'></div>

        {/* Moon for Night Mode */}
        <div className={`moon ${isDarkMode ? 'visible' : ''}`}></div>

        {/* Flying Dove / Bat */}
        <div
          className={`flying-dove ${isDarkMode ? 'bat' : ''}`}
          style={{
            '--bg-1': isDarkMode ? "url('/mur1.png')" : "url('/volando1.png')",
            '--bg-2': isDarkMode ? "url('/mur2.png')" : "url('/volando2.png')",
            '--bg-3': isDarkMode ? "url('/mur3.png')" : "url('/volando3.png')",
          }}
        >
          {!isDarkMode && <div className='dove-drop' style={{ backgroundImage: "url('/cagada.png')" }} />}
        </div>
      </div>

      {/* Navbar */}
      <Navbar
        onNavigate={handleSelectMode}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenAuth={openAuthModal}
        onOpenProfile={() => setShowProfileModal(true)}
        isGuest={isGuest}
      />

      <div className='app-content'>
        {step === 'dashboard' && <DashboardWrapper onSelectMode={handleSelectMode} isGuest={isGuest} onGuestLogin={handleGuestLogin} onOpenAuth={openAuthModal} />}

        {step === 'jobs' && (
          <JobBoard
            onSelectOffer={offer => {
              // Persist active offer (JobBoard already does it, but keep it safe here too).
              if (offer?.id) offersService.setActiveOffer(offer.id)
              setStep('interview')
            }}
            onBack={goDashboard}
          />
        )}


        {step === 'cv-manager' && <CVManager onSelectCV={handleSelectCV} onBack={goDashboard} />}

        {step === 'cv-editor' && (
          <CVEditor
            cvId={activeCVId}
            onBack={() => setStep('cv-manager')}
          />
        )}

        {step === 'cv-questions' && <CVQuestionnaire onCancel={() => setStep('dashboard')} onFinish={handleFinishQuestions} />}

        {step === 'interview' && (
          <InterviewMode
            cvText={storageService.getCVString(currentUser || undefined)}
            activeOffer={activeOffer || offersService.getActiveOffer()}
            onClearOffer={() => {
              setActiveOffer(null)
              offersService.clearActiveOffer()
            }}
            initialMode={'chat'}
            onBack={goDashboard}
          />
        )}

        <TemplatePickerModal
          isOpen={showTemplatePicker}
          onClose={() => {
            setShowTemplatePicker(false)
            setPendingQuestionnaireResult(null)
          }}
          selectedTemplate={templateChoice}
          onSelect={t => {
            setTemplateChoice(t)
            setTimeout(() => handleConfirmTemplate(), 0)
          }}
        />
      </div>
    </div>
  )
}

// Helper to decide view based on Auth
function DashboardWrapper({ onSelectMode, isGuest, onGuestLogin, onOpenAuth }) {
  // Always show Dashboard, bypassing Landing Page. Auth is handled by Navbar
  return <Dashboard onSelectMode={onSelectMode} />
}

export default App
