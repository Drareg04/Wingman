import React, { useState, useEffect, useRef } from 'react';
import { getWingmanResponse, getAnswerFeedback, getInterviewConclusion } from '../../services/ai';
import TalkingAvatar from './TalkingAvatar';
import '../../App.css';

function InterviewMode({ cvText, activeOffer, onClearOffer, initialMode = 'chat', onBack }) {
    const [history, setHistory] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(initialMode);
    const [interviewFinished, setInterviewFinished] = useState(false);
    const [conclusionData, setConclusionData] = useState(null);
    const [isConcluding, setIsConcluding] = useState(false);
    const MAX_QUESTIONS = 4;

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

    // Construct context string - Memoized to prevent effects re-running
    const offerContext = React.useMemo(() => {
        return activeOffer
            ? `PUESTO: ${activeOffer.title} en ${activeOffer.company}. DESC: ${activeOffer.description}`
            : "ENTREVISTA GENERAL (Soft Skills, trayectoria, ambiciones). No hay puesto específico.";
    }, [activeOffer]);

    // --- HELPER: ASYNC FEEDBACK ---
    const fetchFeedbackToHistory = async (question, answer, msgIndex) => {
        const fb = await getAnswerFeedback(question, answer, cvText, offerContext);
        setHistory(prev => {
            const newH = [...prev];
            if (newH[msgIndex]) {
                newH[msgIndex] = { ...newH[msgIndex], feedback: fb };
            }
            return newH;
        });
    };

    // --- HELPER: SEND MESSAGE DIRECTLY ---
    const sendDirectMessage = async (text) => {
        if (!text.trim()) return;

        const currentHistory = historyRef.current;
        const newHist = [...currentHistory, { role: 'user', content: text }];

        const lastQuestion = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].content : '';
        const userQIndex = newHist.length - 1;

        setHistory(newHist);
        setUserAnswer('');
        setLoading(true);

        fetchFeedbackToHistory(lastQuestion, text, userQIndex);

        const userQuestionsCount = newHist.filter(m => m.role === 'user').length;
        if (userQuestionsCount >= MAX_QUESTIONS) {
             setIsConcluding(true);
             setInterviewFinished(true);
             const conc = await getInterviewConclusion(cvText, offerContext, newHist);
             setConclusionData(conc);
             setIsConcluding(false);
             setLoading(false);
             return;
        }

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
        utterance.lang = 'es-ES';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = handleSpeechEnd;
        synthesisRef.current.speak(utterance);
    }, []); // Empty dependencies as we use refs/cancel

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

    const toggleListen = () => {
        if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
        else { recognitionRef.current.start(); setIsListening(true); }
    };

    const handleSendChat = async () => {
        if (!userAnswer.trim()) return;
        
        const lastQuestion = history.length > 0 ? history[history.length - 1].content : '';
        const newHist = [...history, { role: 'user', content: userAnswer }];
        const userQIndex = newHist.length - 1;
        
        setHistory(newHist); setUserAnswer(''); setLoading(true);

        fetchFeedbackToHistory(lastQuestion, userAnswer, userQIndex);

        const userQuestionsCount = newHist.filter(m => m.role === 'user').length;
        if (userQuestionsCount >= MAX_QUESTIONS) {
             setIsConcluding(true);
             setInterviewFinished(true);
             const conc = await getInterviewConclusion(cvText, offerContext, newHist);
             setConclusionData(conc);
             setIsConcluding(false);
             setLoading(false);
             return;
        }

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

    // --- RENDER FINISHED MODE ---
    if (interviewFinished) {
        return (
            <div className="panel-card" style={{ height: '85vh', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '30px' }}>
                <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>🎯 Entrevista Finalizada</h2>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Has completado las {MAX_QUESTIONS} preguntas. Wingman ha evaluado tu perfil.</p>
                
                {isConcluding ? (
                    <div style={{ textAlign: 'center', margin: '40px 0', fontSize: '1.2rem', color: '#3b82f6' }}>
                        Analizando respuestas y generando conclusión final... ⏳
                    </div>
                ) : (
                    <div style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.7', fontSize: '1.05rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        {conclusionData || 'Hubo un problema al generar la conclusión. Intenta de nuevo.'}
                    </div>
                )}
                
                <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center' }}>
                    <button className="btn-save" onClick={onBack} style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

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
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    MODO CHAT
                    <button onClick={() => setMode('voice')} style={{ marginLeft: '10px', fontSize: '0.8rem', cursor: 'pointer', border: 'none', background: 'transparent', textDecoration: 'underline' }}>
                        (Pasar a Voz)
                    </button>
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
                        {msg.feedback && (
                            <div style={{ 
                                fontSize: '0.85rem', 
                                background: '#f0f9ff', 
                                padding: '12px', 
                                marginTop: '10px', 
                                borderRadius: '10px', 
                                color: '#0369a1', 
                                border: '1px solid #bae6fd',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                textAlign: 'left'
                            }}>
                                <strong style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>💡 Feedback Wingman:</strong>
                                <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{msg.feedback}</span>
                            </div>
                        )}
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
