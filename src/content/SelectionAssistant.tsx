import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { storage } from '../storage';
import { explainText } from './gemini';

interface TooltipPos {
    left: number;
    top: number;
}

const SelectionAssistant: React.FC = () => {
    const [selectedText, setSelectedText] = useState('');
    const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState('');

    const handleMouseUp = useCallback((e: MouseEvent) => {
        // Don't interfere with clicks inside our own UI
        const target = e.target as Node;
        const shadowHost = document.querySelector('[data-autobb-shadow]');
        if (shadowHost?.shadowRoot?.contains(target)) return;

        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection?.toString().trim() ?? '';
            if (text.length >= 2 && selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const left = Math.min(rect.right - 20, window.innerWidth - 48);
                const top = Math.min(rect.bottom + 8, window.innerHeight - 48);
                setSelectedText(text);
                setTooltipPos({ left, top });
            } else {
                setTooltipPos(null);
            }
        }, 0);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setPanelOpen(false);
            setTooltipPos(null);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleMouseUp, handleKeyDown]);

    const handleExplainClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        window.getSelection()?.removeAllRanges();
        setTooltipPos(null);
        setPanelOpen(true);
        setLoading(true);
        setExplanation('');
        setError('');

        try {
            const apiKey = await storage.getGeminiApiKey();
            if (!apiKey) {
                setError('No API key configured. Go to AutoBB Settings to add your Gemini API key.');
                setLoading(false);
                return;
            }
            const result = await explainText(selectedText, apiKey);
            setExplanation(result);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const closePanel = () => {
        setPanelOpen(false);
        setExplanation('');
        setError('');
    };

    const truncated = selectedText.length > 80 ? selectedText.slice(0, 80) + '…' : selectedText;

    return (
        <>
            {/* Tooltip Icon */}
            {tooltipPos && !panelOpen && (
                <button
                    onClick={handleExplainClick}
                    title="Explain with AI"
                    style={{
                        position: 'fixed',
                        left: tooltipPos.left,
                        top: tooltipPos.top,
                        zIndex: 2147483647,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                        pointerEvents: 'auto',
                    }}
                >
                    <Sparkles size={14} color="white" />
                </button>
            )}

            {/* Backdrop + Panel */}
            {panelOpen && (
                <>
                    {/* Transparent backdrop for click-outside dismiss */}
                    <div
                        onClick={closePanel}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2147483646,
                            background: 'transparent',
                        }}
                    />

                    {/* Explanation Panel */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2147483647,
                            width: 340,
                            maxWidth: 'calc(100vw - 32px)',
                            borderRadius: 16,
                            background: 'rgba(255,255,255,0.65)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #059669, #10b981)',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={16} color="white" />
                                <span style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em' }}>
                                    AI Explain
                                </span>
                            </div>
                            <button
                                onClick={closePanel}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={13} color="white" />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '14px 16px 16px' }}>
                            {/* Quote block */}
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.5)',
                                    border: '1px solid rgba(255,255,255,0.4)',
                                    borderRadius: 10,
                                    padding: '8px 12px',
                                    marginBottom: 12,
                                    fontSize: 11,
                                    color: '#6b7280',
                                    fontStyle: 'italic',
                                    lineHeight: 1.5,
                                }}
                            >
                                "{truncated}"
                            </div>

                            {/* State: loading */}
                            {loading && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 13 }}>
                                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                                    Asking Gemini...
                                </div>
                            )}

                            {/* State: explanation */}
                            {!loading && explanation && (
                                <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6, margin: 0 }}>
                                    {explanation}
                                </p>
                            )}

                            {/* State: error */}
                            {!loading && error && (
                                <div
                                    style={{
                                        background: 'rgba(254,226,226,0.7)',
                                        border: '1px solid rgba(252,165,165,0.5)',
                                        borderRadius: 10,
                                        padding: '10px 12px',
                                        fontSize: 12,
                                        color: '#b91c1c',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default SelectionAssistant;
