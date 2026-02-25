import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

function Navbar({ onNavigate, onStartTutorial, isDarkMode, toggleDarkMode, onOpenAuth, onOpenProfile, isGuest }) {
    const { currentUser, logout } = useAuth();

    // Auto-redirect to dashboard (Landing Page) if logged out while inside a protected step
    useEffect(() => {
        if (!currentUser && !isGuest) {
            onNavigate('dashboard');
        }
    }, [currentUser, isGuest, onNavigate]);

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 5%',
            background: 'transparent', // Let the sky show through
            position: 'relative',
            zIndex: 1000,
            marginBottom: '60px'
        }}>
            {/* Logo Area - Pixel Style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
                <img
                    src="/paloma.gif"
                    alt="Logo"
                    style={{
                        height: '60px',
                        filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.2))'
                    }}
                />
                <h1 style={{
                    margin: 0,
                    fontSize: '2.5rem',
                    fontFamily: "'VT323', monospace",
                    color: 'white',
                    textShadow: '4px 4px 0px #1e3a8a',
                    letterSpacing: '3px'
                }}>
                    WINGMAN
                </h1>
            </div>

            {/* Simulated Desktop Links */}
            {(currentUser || isGuest) && (
                <div className="tour-nav-links" style={{ display: 'flex', gap: '30px' }}>
                    {['INICIO', 'ENTREVISTAS', 'MIS CVS'].map(link => (
                        <span
                            key={link}
                            onClick={() => {
                                if (link === 'INICIO') {
                                    onNavigate('dashboard');
                                } else {
                                    if (link === 'ENTREVISTAS') onNavigate('interview');
                                    else if (link === 'MIS CVS') onNavigate('cv-manager');
                                }
                            }}
                            style={{
                                cursor: 'pointer',
                                color: 'white',
                                fontFamily: "'VT323', monospace",
                                fontSize: '1.5rem',
                                textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                                borderBottom: '2px solid transparent'
                            }}
                            onMouseEnter={e => e.target.style.borderBottom = '2px solid white'}
                            onMouseLeave={e => e.target.style.borderBottom = 'transparent'}
                        >
                            {link}
                        </span>
                    ))}
                </div>
            )}

            {/* Auth Area - Retro Buttons */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', padding: '5px', borderRadius: '50%',
                        transition: 'transform 0.5s ease',
                        transform: isDarkMode ? 'rotate(-360deg)' : 'rotate(0deg)'
                    }}
                    title={isDarkMode ? "Modo Día" : "Modo Noche"}
                >
                    {isDarkMode ? <Sun size={32} /> : <Moon size={32} />}
                </button>




                {currentUser ? (
                    <div className="tour-profile" style={{
                        display: 'flex', alignItems: 'center', gap: '15px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '5px 15px',
                        borderRadius: '15px',
                        border: '2px solid white',
                        backdropFilter: 'blur(5px)'
                    }}>


                        <div
                            onClick={onOpenProfile}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px', borderRadius: '10px', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            title="Ajustes de Perfil"
                        >
                            <img
                                src={currentUser.photoURL || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + (currentUser.email || 'guest')}
                                alt="User"
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }}
                            />
                            <span style={{
                                fontSize: '1.2rem',
                                color: 'white',
                                fontFamily: "'VT323', monospace",
                                textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
                            }}>
                                {(currentUser.displayName || 'Piloto').split(' ')[0]}
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            style={{
                                background: '#ef4444',
                                border: 'none',
                                borderBottom: '4px solid #b91c1c',
                                color: 'white',
                                cursor: 'pointer',
                                fontFamily: "'VT323', monospace",
                                fontSize: '1.2rem',
                                padding: '5px 10px',
                                borderRadius: '8px'
                            }}
                        >
                            SALIR
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => onOpenAuth('login')}
                            style={{
                                background: 'white',
                                border: 'none',
                                borderBottom: '4px solid #cbd5e1',
                                color: '#333',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontFamily: "'VT323', monospace",
                                fontSize: '1.5rem',
                                textTransform: 'uppercase'
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => onOpenAuth('register')}
                            style={{
                                background: '#f97316',
                                border: 'none',
                                borderBottom: '4px solid #c2410c',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontFamily: "'VT323', monospace",
                                fontSize: '1.5rem',
                                textTransform: 'uppercase'
                            }}
                        >
                            Registro
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
