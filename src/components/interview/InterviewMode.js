import React, { useState, useEffect, useRef } from 'react';
import { getWingmanResponse } from '../../services/ai';
import TalkingAvatar from './TalkingAvatar';
import '../../App.css';

function InterviewMode({ cvText, activeOffer, onClearOffer, initialMode = 'chat', onBack }) {
    const [history, setHistory] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(initialMode);

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Speech language (dictation + TTS)
    const [speechLang, setSpeechLang] = useState('es-ES');

    const synthesisRef = useRef(window.speechSynthesis);
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    // Live transcript buffer while listening
    const liveTranscriptRef = useRef('');

    // Refs for accessing state in event listeners without re-binding
    const historyRef = useRef(history);
    const modeRef = useRef(mode);

    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    // Construct context string - Memoized to prevent effects re-running
    const offerContext = React.useMemo(() => {
        return activeOffer
            ? `PUESTO: ${activeOffer.title} en ${activeOffer.company}. DESC: ${activeOffer.description}`
            : "ENTREVISTA GENERAL (Soft Skills, trayectoria, ambiciones). No hay puesto específico.";
    }, [activeOffer]);

    // --- HELPER: SEND MESSAGE DIRECTLY ---
    const sendDirectMessage = async (text) => {
        if (!text.trim()) return;

        const currentHistory = historyRef.current;
        const newHist = [...currentHistory, { role: 'user', content: text }];

        setHistory(newHist);
        setUserAnswer('');
        liveTranscriptRef.current = '';
        setLoading(true);

        const res = await getWingmanResponse(cvText, offerContext, newHist);

        setHistory(prev => [...prev, { role: 'assistant', content: res }]);

        // Use the ref to check mode, just in case it changed mid-request
        if (modeRef.current === 'voice' || isSpeaking) speak(res);
        setLoading(false);
    };

    const speak = React.useCallback((text) => {
        if (!synthesisRef.current) return;
        synthesisRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLang;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = handleSpeechEnd;
        synthesisRef.current.speak(utterance);
    }, [speechLang]);

    // --- INIT ---
    useEffect(() => {
        const startInterview = async () => {
            setLoading(true);
            const firstMsg = await getWingmanResponse(cvText, offerContext, []);
            setHistory([{ role: 'assistant', content: firstMsg }]);
            if (initialMode === 'voice') speak(firstMsg);
            setLoading(false);
        };
        startInterview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cvText, offerContext]); // Only triggers when context or CV change


    // --- VOICE SETUP ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = speechLang;

            recognitionRef.current.onresult = (event) => {
                let interim = '';
                let finalText = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    const t = res[0]?.transcript || '';
                    if (res.isFinal) finalText += t;
                    else interim += t;
                }

                // Update live buffer
                if (finalText) {
                    liveTranscriptRef.current = `${liveTranscriptRef.current} ${finalText}`.trim();
                }

                // In chat mode show live transcript inside textarea while listening
                if (modeRef.current !== 'voice') {
                    const base = liveTranscriptRef.current;
                    const live = `${base} ${interim}`.trim();
                    setUserAnswer(live);
                }

                // In voice mode: when a final chunk arrives, autosend it
                if (modeRef.current === 'voice' && finalText.trim()) {
                    setIsListening(false);
                    try { recognitionRef.current.stop(); } catch (e) { }
                    const toSend = `${liveTranscriptRef.current}`.trim();
                    liveTranscriptRef.current = '';
                    sendDirectMessage(toSend);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When language changes, apply it to recognition and restart if currently listening
    useEffect(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.lang = speechLang;
        if (isListening) {
            try { recognitionRef.current.stop(); } catch (e) { }
            setTimeout(() => {
                try { recognitionRef.current.start(); } catch (e) { }
            }, 150);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speechLang]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);

    // Auto-listen after AI finishes speaking in Voice Mode
    const handleSpeechEnd = () => {
        setIsSpeaking(false);
        if (modeRef.current === 'voice') {
            setTimeout(() => {
                try {
                    liveTranscriptRef.current = '';
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (e) { console.log("Mic auto-start error or already started"); }
            }, 500); // Small delay to avoid conflict
        }
    };

    const toggleListen = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            try { recognitionRef.current.stop(); } catch (e) { }
            setIsListening(false);
        }
        else {
            liveTranscriptRef.current = '';
            try { recognitionRef.current.start(); } catch (e) { }
            setIsListening(true);
        }
    };

    const handleSendChat = async () => {
        if (!userAnswer.trim()) return;
        const newHist = [...history, { role: 'user', content: userAnswer }];
        setHistory(newHist); setUserAnswer(''); setLoading(true);
        liveTranscriptRef.current = '';

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
                    <TalkingAvatar isSpeaking={isSpeaking} size="300px" />
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
        <div className="panel-card" style={{ height: '85vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative', minHeight: '40px', gap: '20px' }}>
                <button
                    className="btn-back"
                    onClick={onBack}
                    style={{ position: 'static', margin: 0, transform: 'none' }}
                >
                    ⬅ SALIR
                </button>
                <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span>MODO CHAT</span>
                    <button onClick={() => setMode('voice')} style={{ fontSize: '0.8rem', cursor: 'pointer', border: 'none', background: 'transparent', textDecoration: 'underline' }}>
                        (Pasar a Voz)
                    </button>

                    <span style={{ marginLeft: 8, fontSize: '0.8rem' }}>Idioma:</span>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                            onClick={() => setSpeechLang('es-ES')}
                            style={{
                                fontSize: '0.8rem',
                                padding: '2px 8px',
                                borderRadius: 8,
                                border: '1px solid #cbd5e1',
                                background: speechLang === 'es-ES' ? '#e2e8f0' : 'transparent',
                                cursor: 'pointer'
                            }}
                            title="Castellano"
                        >
                            ES
                        </button>
                        <button
                            onClick={() => setSpeechLang('ca-ES')}
                            style={{
                                fontSize: '0.8rem',
                                padding: '2px 8px',
                                borderRadius: 8,
                                border: '1px solid #cbd5e1',
                                background: speechLang === 'ca-ES' ? '#e2e8f0' : 'transparent',
                                cursor: 'pointer'
                            }}
                            title="Català"
                        >
                            CA
                        </button>
                    </div>
                </div>
            </div>

            {/* Lamp Post Avatar (Left Side) */}
            <div className="lamp-post-container" style={{
                position: 'absolute',
                top: '220px',
                left: '-200px', // Adjusted to fit the image
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 50
            }}>
                {/* Pigeon sitting on top */}
                <div style={{ position: 'relative', top: '25px', zIndex: 2 }}>
                    <TalkingAvatar isSpeaking={loading || isSpeaking} size="140px" />
                </div>

                {/* Pole Image */}
                <img
                    src="/poste.png"
                    alt="Poste"
                    style={{
                        width: '180px', // Adjust width as needed for the image
                        height: 'auto',
                        filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.3))'
                    }}
                />
            </div>

            {/* CONTEXT BAR */}
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginRight: '140px' }}> {/* Add margin to avoid widget */}
                <span>
                    {activeOffer ? `🎯 ${activeOffer.title} @ ${activeOffer.company}` : `💬 Entrevista General`}
                </span>
                {activeOffer && (
                    <button onClick={onClearOffer} style={{ fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', padding: '2px 8px', cursor: 'pointer' }}>
                        X Quitar
                    </button>
                )}
            </div>

            <div className="chat-window" style={{ flex: 1, paddingRight: '140px' }}> {/* Add paddingRight so text doesn't go under the widget */}

                {history.map((msg, i) => (
                    <div key={i} className={`msg ${msg.role === 'user' ? 'user-msg' : 'wingman-msg'}`}>
                        {msg.content}
                    </div>
                ))}

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
            {/* Hide Lamp on very small screens to avoid overlap/overflow */}
            <style>{`
                @media (max-width: 1100px) {
                    .lamp-post-container { display: none !important; }
                }
            `}</style>
        </div>
    );
}

export default InterviewMode;
