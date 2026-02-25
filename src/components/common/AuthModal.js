import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, X } from 'lucide-react';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const { loginWithEmail, registerWithEmail } = useAuth();
    const [isLogin, setIsLogin] = useState(initialMode === 'login');

    useEffect(() => {
        if (isOpen) {
            setIsLogin(initialMode === 'login');
            setError('');
        }
    }, [isOpen, initialMode]);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                if (!name.trim()) throw new Error("Por favor, introduce tu nombre.");
                await registerWithEmail(email, password, name);
            }
            onClose(); // Close on success
        } catch (err) {
            console.error(err);
            // Firebase error translation (basic)
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Correo o contraseña incorrectos.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Ese correo ya está registrado.");
            } else if (err.code === 'auth/weak-password') {
                setError("La contraseña debe tener al menos 6 caracteres.");
            } else {
                setError(err.message);
            }
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '40px',
                width: '100%', maxWidth: '400px', position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                textAlign: 'center'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '2.5rem', marginTop: 0, color: '#1e3a8a' }}>
                    {isLogin ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
                </h2>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {!isLogin && (
                        <div style={{ position: 'relative' }}>
                            <User size={20} color="#94a3b8" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                            <input
                                type="text"
                                placeholder="Tu Nombre"
                                value={name} onChange={(e) => setName(e.target.value)}
                                style={{ paddingLeft: '45px', width: '100%', margin: 0 }}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={20} color="#94a3b8" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            style={{ paddingLeft: '45px', width: '100%', margin: 0 }}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} color="#94a3b8" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingLeft: '45px', width: '100%', margin: 0 }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-pixel"
                        style={{ marginTop: '10px' }}
                    >
                        {loading ? 'Cargando...' : (isLogin ? 'Acceder' : 'Crear Cuenta')}
                    </button>
                </form>



                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
                    {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <span
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
                    </span>
                </div>

            </div>
        </div>
    );
}

export default AuthModal;
