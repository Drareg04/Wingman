import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Image as ImageIcon, Mail, X } from 'lucide-react';

function ProfileModal({ isOpen, onClose }) {
    const { currentUser, updateUserProfile } = useAuth();
    
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser) {
            setName(currentUser.displayName || '');
            setPhotoUrl(currentUser.photoURL || '');
            setEmail(currentUser.email || '');
            setError('');
            setSuccess('');
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!name.trim()) throw new Error("El nombre no puede estar vacío.");
            if (!email.trim()) throw new Error("El correo no puede estar vacío.");
            await updateUserProfile(name, photoUrl, email);
            setSuccess('¡Perfil actualizado con éxito!');
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                    AJUSTES DE PERFIL
                </h2>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
                {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{success}</div>}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <img 
                        src={photoUrl || (currentUser ? 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + (currentUser.email || 'guest') : '')} 
                        alt="Preview" 
                        style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #1e3a8a', objectFit: 'cover' }}
                    />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <div style={{ position: 'relative' }}>
                        <User size={20} color="#94a3b8" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                        <input
                            type="text"
                            placeholder="Tu Nombre"
                            value={name} onChange={(e) => setName(e.target.value)}
                            style={{ paddingLeft: '45px', width: '100%', margin: 0 }}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Mail size={20} color="#94a3b8" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                        <input
                            type="email"
                            placeholder="Tu Correo"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            style={{ paddingLeft: '45px', width: '100%', margin: 0 }}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <ImageIcon size={20} color="#94a3b8" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                        <input
                            type="text"
                            placeholder="URL de Foto (opcional)"
                            value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
                            style={{ paddingLeft: '45px', width: '100%', margin: 0 }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-pixel"
                        style={{ marginTop: '10px', width: '100%' }}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default ProfileModal;
