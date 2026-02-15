import React, { useState, useEffect, useRef } from 'react';
import { getWingmanResponse } from '../../services/ai';
import '../../App.css';

function InterviewMode({ cvText, activeOffer, onClearOffer, initialMode = 'chat', onBack }) {
    const [history, setHistory] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(initialMode);

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthesisRef = useRef(window.speechSynthesis);
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    // Refs for accessing state in event listeners without re-binding
    const historyRef = useRef(history);
    const modeRef = useRef(mode);

    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    // Construct context string
    const offerContext = activeOffer
        ? `PUESTO: ${activeOffer.title} en ${activeOffer.company}. DESC: ${activeOffer.description}`
        : "ENTREVISTA GENERAL (Soft Skills, trayectoria, ambiciones). No hay puesto específico.";

    // --- HELPER: SEND MESSAGE DIRECTLY ---
    const sendDirectMessage = async (text) => {
        if (!text.trim()) return;

        const currentHistory = historyRef.current;
        const newHist = [...currentHistory, { role: 'user', content: text }];

        setHistory(newHist);
        setUserAnswer('');
        setLoading(true);

        const res = await getWingmanResponse(cvText, offerContext, newHist);

        setHistory(prev => [...prev, { role: 'assistant', content: res }]);

        // Use the ref to check mode, just in case it changed mid-request
        if (modeRef.current === 'voice' || isSpeaking) speak(res);
        setLoading(false);
    };

    // --- INIT ---
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const startInterview = async () => {
            setLoading(true);
            const firstMsg = await getWingmanResponse(cvText, offerContext, []);
            setHistory([{ role: 'assistant', content: firstMsg }]);
            if (initialMode === 'voice') speak(firstMsg);
            setLoading(false);
        };
        startInterview();
    }, [activeOffer]);

    // --- VOICE SETUP ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-ES';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);

                // Logic based on current mode
                if (modeRef.current === 'voice') {
                    // Auto-send in Voice Mode
                    sendDirectMessage(transcript);
                } else {
                    // Accumulate in Chat Mode
                    setUserAnswer(prev => prev + " " + transcript);
                }
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);

    // Auto-listen after AI finishes speaking in Voice Mode
    const handleSpeechEnd = () => {
        setIsSpeaking(false);
        if (modeRef.current === 'voice') {
            setTimeout(() => {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (e) { console.log("Mic auto-start error or already started"); }
            }, 500); // Small delay to avoid conflict
        }
    };

    const speak = (text) => {
        if (!synthesisRef.current) return;
        synthesisRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = handleSpeechEnd;
        synthesisRef.current.speak(utterance);
    };

    const toggleListen = () => {
        if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
        else { recognitionRef.current.start(); setIsListening(true); }
    };

    const handleSendChat = async () => {
        if (!userAnswer.trim()) return;
        const newHist = [...history, { role: 'user', content: userAnswer }];
        setHistory(newHist); setUserAnswer(''); setLoading(true);

        const res = await getWingmanResponse(cvText, offerContext, newHist);

        setHistory(prev => [...prev, { role: 'assistant', content: res }]);
        if (mode === 'voice' || isSpeaking) speak(res);
        setLoading(false);
    };

    // Cleanup speech on unmount
    useEffect(() => {
        const synthesis = synthesisRef.current;
        return () => synthesis.cancel();
    }, []);

    // --- RENDER VOICE MODE ---
    if (mode === 'voice') {
        const lastMessage = history.length > 0 ? history[history.length - 1].content : "Escuchando...";

        return (
            <div className="panel-card" style={{ height: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#e0f2fe' }}>
                {/* Header / Exit */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                    <button className="btn-back" onClick={() => { synthesisRef.current.cancel(); onBack(); }}>⬅ SALIR</button>
                </div>

                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                    <button onClick={() => setMode('chat')} style={{ background: 'white', border: '2px solid #3b82f6', padding: '5px 10px', borderRadius: '10px', cursor: 'pointer' }}>
                        💬 Ir al Chat
                    </button>
                </div>

                {/* AVATAR AREA */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img
                        src="/paloma.gif"
                        alt="Wingman Speaking"
                        style={{
                            width: '250px',
                            height: '250px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                            transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.2s ease-in-out'
                        }}
                    />
                    {/* Visual EQ Circle */}
                    <div style={{
                        width: '30px', height: '30px',
                        borderRadius: '50%',
                        background: isSpeaking ? '#22c55e' : (isListening ? '#f97316' : '#94a3b8'),
                        margin: '20px auto',
                        boxShadow: isSpeaking ? '0 0 20px #22c55e' : 'none',
                        animation: isSpeaking ? 'pulse 1s infinite' : 'none'
                    }}></div>
                </div>

                {/* SUBTITLES / STATUS */}
                <div style={{ maxWidth: '600px', textAlign: 'center', minHeight: '60px', padding: '20px', background: 'rgba(255,255,255,0.8)', borderRadius: '15px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#334155', fontStyle: 'italic' }}>
                        "{lastMessage.substring(0, 150)}{lastMessage.length > 150 ? '...' : ''}"
                    </p>
                    {isListening && <p style={{ color: '#f97316', fontWeight: 'bold', marginTop: '10px' }}>🎤 Escuchando...</p>}
                </div>

                {/* Manual Controls */}
                <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                    <button onClick={toggleListen} className={`btn-mic ${isListening ? 'listening' : ''}`} style={{ width: 'auto', padding: '10px 30px', fontSize: '1.2rem' }}>
                        {isListening ? '🛑 Parar' : '🎤 Hablar'}
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER CHAT MODE ---
    return (
        <div className="panel-card" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <button className="btn-back" onClick={onBack} style={{ margin: 0, position: 'relative', left: 0, top: 0 }}>⬅ SALIR</button>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    💬 MODO CHAT
                    <button onClick={() => setMode('voice')} style={{ marginLeft: '10px', fontSize: '0.8rem', cursor: 'pointer', border: 'none', background: 'transparent', textDecoration: 'underline' }}>
                        (Pasar a Voz)
                    </button>
                </div>
                {isSpeaking && <div className="mini-orb">🔊</div>}
            </div>

            {/* CONTEXT BAR */}
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span>
                    {activeOffer ? `🎯 ${activeOffer.title} @ ${activeOffer.company}` : `💬 Entrevista General`}
                </span>
                {activeOffer && (
                    <button onClick={onClearOffer} style={{ fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', padding: '2px 8px', cursor: 'pointer' }}>
                        X Quitar
                    </button>
                )}
            </div>

            <div className="chat-window" style={{ flex: 1 }}>
                {history.map((msg, i) => (
                    <div key={i} className={`msg ${msg.role === 'user' ? 'user-msg' : 'wingman-msg'}`}>
                        {msg.content}
                    </div>
                ))}
                {loading && <i>Wingman está pensando...</i>}
                <div ref={chatEndRef} />
            </div>

            <div className="controls-area">
                <button className={`btn-mic ${isListening ? 'listening' : ''}`} onClick={toggleListen}>
                    {isListening ? '🛑' : '🎙️'}
                </button>

                <textarea
                    className="chat-input"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                    placeholder={isListening ? "Escuchando..." : "Escribe tu respuesta..."}
                />

                <button className="btn-send" onClick={handleSendChat} disabled={loading}>➤</button>
            </div>
        </div>
    );
}

export default InterviewMode;
