
import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeakOptions {
    text: string;
    voice: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
    sentencePause?: number; // in seconds
}

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pauseTimeoutRef = useRef<number | null>(null);

    const populateVoiceList = useCallback(() => {
        try {
            const newVoices = window.speechSynthesis.getVoices();
            if(newVoices.length > 0) {
               setVoices(newVoices);
            }
        } catch(e) {
            console.error("Could not get voices", e);
        }
    }, []);

    const cancel = useCallback(() => {
        if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = null;
        }
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }
        setIsPreparing(false);
        setIsSpeaking(false);
        setIsPaused(false);
    }, []);

    useEffect(() => {
        populateVoiceList();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            cancel();
        };
    }, [populateVoiceList, cancel]);

    const speak = useCallback(({ text, voice, rate = 1, pitch = 1, volume = 1, sentencePause = 0 }: SpeakOptions) => {
        if (!text || !voice) return;

        cancel();
        setError(null);
        setIsPreparing(true);

        const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g)?.map(s => s.trim()).filter(Boolean) || [text.trim()].filter(Boolean);
        
        if (sentences.length === 0) {
            setIsPreparing(false);
            return;
        }

        let sentenceIndex = 0;
        
        const speakNext = () => {
            if (sentenceIndex >= sentences.length) {
                // This state is now handled by the last utterance's onend event
                return;
            }

            const utterance = new SpeechSynthesisUtterance(sentences[sentenceIndex]);
            utterance.voice = voice;
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = volume;

            utterance.onstart = () => {
                setIsPreparing(false);
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                sentenceIndex++;
                if (sentenceIndex < sentences.length) {
                    if (sentencePause > 0) {
                        pauseTimeoutRef.current = window.setTimeout(speakNext, sentencePause * 1000);
                    } else {
                        speakNext();
                    }
                } else {
                    setIsSpeaking(false);
                    setIsPaused(false);
                }
            };
            
            utterance.onpause = () => setIsPaused(true);
            utterance.onresume = () => setIsPaused(false);

            utterance.onerror = (event) => {
                // The 'canceled' error is expected when we interrupt speech by calling cancel().
                // We should not treat it as a real error that needs to be handled.
                if (event.error === 'canceled') {
                    return;
                }
                
                console.error("SpeechSynthesis Error:", event.error);
                setError(event.error);
                setIsPreparing(false);
                setIsSpeaking(false);
                setIsPaused(false);
            };

            window.speechSynthesis.speak(utterance);
        };

        speakNext();

    }, [cancel]);

    const pause = useCallback(() => {
        if(isSpeaking && !isPaused) {
            window.speechSynthesis.pause();
        }
    }, [isSpeaking, isPaused]);

    const resume = useCallback(() => {
        if(isPaused) {
            window.speechSynthesis.resume();
        }
    }, [isPaused]);

    return { voices, speak, cancel, isSpeaking, isPaused, isPreparing, pause, resume, error };
};
