import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ActionButton } from './components/ActionButton';
import { ControlSlider } from './components/ControlSlider';
import { VoiceSelector } from './components/VoiceSelector';
import { EngineSelector } from './components/EngineSelector';
import { Tabs } from './components/Tabs';
import { VoiceFilters } from './components/VoiceFilters';
import { MyVoicesPanel } from './components/MyVoicesPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ControlDropdown } from './components/ControlDropdown';
import { SpinnerIcon, PlayIcon, PauseIcon, StopIcon, DownloadIcon } from './components/Icons';
import type { AIVoice, HistoryItem, DownloadFormat, Emotion, BrowserIntonation, InputMode } from './types';
import { InputModeSwitcher } from './components/InputModeSwitcher';
import { AudioPlayer } from './components/AudioPlayer';

const aiVoices: AIVoice[] = [
    { name: 'Aria', lang: 'en-US', voiceURI: 'ai-aria', gender: 'female', default: true },
    { name: 'Leo', lang: 'en-US', voiceURI: 'ai-leo', gender: 'male' },
    { name: 'Nova', lang: 'en-GB', voiceURI: 'ai-nova', gender: 'female' },
    { name: 'Orion', lang: 'en-AU', voiceURI: 'ai-orion', gender: 'male' },
    { name: 'Elara', lang: 'fr-FR', voiceURI: 'ai-elara', gender: 'female' },
    { name: 'Mateo', lang: 'es-ES', voiceURI: 'ai-mateo', gender: 'male' },
];

const SSML_PLACEHOLDER = `<speak>
    Here is a sentence in SSML.
    You can control emphasis, like this: <emphasis level="strong">very</emphasis> important.
    Or adjust the speaking rate <prosody rate="slow">for dramatic effect</prosody>.
</speak>`;

const PLAIN_TEXT_PLACEHOLDER = "Enter text to synthesize...";

// Splits text into chunks of reasonable size for streaming simulation
const chunkText = (text: string, maxLength = 200): string[] => {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
    if (sentences.length === 0) {
        return text ? [text] : [];
    }

    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        currentChunk += sentence;
    }
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
};

// Estimates duration in seconds based on average words per minute
const estimateDuration = (text: string, wpm = 165): number => {
    if (!text) return 0;
    const wordCount = text.trim().split(/\s+/).length;
    return (wordCount / wpm) * 60;
};


export default function App() {
    const [text, setText] = useState<string>("This is a long text to demonstrate the power of streaming audio synthesis. Instead of waiting for the entire clip to be generated, playback starts almost immediately. As you listen to the first part, the next segments are being synthesized in the background, ensuring a smooth, uninterrupted experience without a long initial delay.");
    const [engine, setEngine] = useState<'browser' | 'ai'>('browser');
    const [activeTab, setActiveTab] = useState('synthesizer');
    const [inputMode, setInputMode] = useState<InputMode>('text');

    // Browser speech synthesis state
    const { voices, speak, cancel, isSpeaking, isPaused, pause, resume, isPreparing } = useSpeechSynthesis();
    const [selectedBrowserVoiceURI, setSelectedBrowserVoiceURI] = useState<string | null>(null);
    const [rate, setRate] = useState<number>(1);
    const [pitch, setPitch] = useState<number>(1);
    const [volume, setVolume] = useState<number>(1);
    const [sentencePause, setSentencePause] = useState<number>(0.5);
    const [browserIntonation, setBrowserIntonation] = useState<BrowserIntonation>('neutral');
    const [isDownloadingBrowser, setIsDownloadingBrowser] = useState(false);

    // AI (backend) speech synthesis state
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isPlayingAI, setIsPlayingAI] = useState(false);
    const [downloadableAudioUrl, setDownloadableAudioUrl] = useState<string | null>(null);
    const [selectedAIVoiceURI, setSelectedAIVoiceURI] = useState<string>(aiVoices.find(v => v.default)?.voiceURI || aiVoices[0].voiceURI);
    const [emotion, setEmotion] = useState<Emotion>('neutral');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const stopStreamingRef = useRef(false);

    // AI Streaming & Player specific state
    const [synthesisProgress, setSynthesisProgress] = useState<{ current: number, total: number } | null>(null);
    const [audioQueue, setAudioQueue] = useState<string[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
    const [estimatedTotalDuration, setEstimatedTotalDuration] = useState(0);
    const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
    const [chunkDurations, setChunkDurations] = useState<number[]>([]);
    const timeUpdateIntervalRef = useRef<number | null>(null);
    
    // Shared state
    const [favoriteVoices, setFavoriteVoices] = useState<string[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [languageFilter, setLanguageFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
    const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('mp3');

    const isBusy = isPreparing || isSpeaking || isLoadingAI || isPlayingAI || isDownloadingBrowser;

    // Load state from localStorage
    useEffect(() => {
        const storedFavorites = localStorage.getItem('tts_favorite_voices');
        if (storedFavorites) setFavoriteVoices(JSON.parse(storedFavorites));

        const storedHistory = localStorage.getItem('tts_history');
        if (storedHistory) setHistory(JSON.parse(storedHistory));
    }, []);
    
    useEffect(() => {
        if (voices.length > 0 && !selectedBrowserVoiceURI) {
            const defaultVoice = voices.find(voice => voice.default) || voices[0];
            setSelectedBrowserVoiceURI(defaultVoice.voiceURI);
        }
    }, [voices, selectedBrowserVoiceURI]);
    
    // Apply intonation presets for browser engine
    useEffect(() => {
        if (engine === 'browser') {
            const presets = {
                neutral: { rate: 1, pitch: 1 },
                happy: { rate: 1.15, pitch: 1.2 },
                sad: { rate: 0.85, pitch: 0.8 },
            };
            const { rate: newRate, pitch: newPitch } = presets[browserIntonation];
            setRate(newRate);
            setPitch(newPitch);
        }
    }, [browserIntonation, engine]);

    // Update estimated duration when text changes
    useEffect(() => {
        if (engine === 'ai' && inputMode === 'text') {
            const duration = estimateDuration(text);
            setEstimatedTotalDuration(duration);
        } else {
            setEstimatedTotalDuration(0);
        }
    }, [text, engine, inputMode]);

    useEffect(() => {
        handleStop();
    }, [engine, inputMode]);
    
    const handleBrowserSpeak = () => {
        const selectedVoice = voices.find(voice => voice.voiceURI === selectedBrowserVoiceURI);
        if (selectedVoice) {
            speak({ text, voice: selectedVoice, rate, pitch, volume, sentencePause });
        }
    };

    const handleBrowserDownload = async () => {
        if (!text || isDownloadingBrowser) return;
        setIsDownloadingBrowser(true);
        try {
            const voice = 'Brian';
            const encodedText = encodeURIComponent(text);
            const apiUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodedText}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `browser_speech.${downloadFormat}`;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error("Browser TTS download failed:", error);
            alert("Sorry, the audio could not be downloaded.");
        } finally {
            setIsDownloadingBrowser(false);
        }
    };
    
    const handleAIStop = () => {
        stopStreamingRef.current = true;
        if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current = null;
        }
        setIsLoadingAI(false);
        setIsPlayingAI(false);
        setDownloadableAudioUrl(null);
        setSynthesisProgress(null);
        setAudioQueue([]);
        setCurrentQueueIndex(0);
        setPlayerCurrentTime(0);
        setChunkDurations([]);
    };
    
    const handleAIStream = () => {
        if (!text) return;
        handleAIStop();
        stopStreamingRef.current = false;
        setIsLoadingAI(true);
        
        const chunks = inputMode === 'ssml' ? [text] : chunkText(text);
        if (chunks.length === 0) {
            setIsLoadingAI(false);
            return;
        }
        
        setSynthesisProgress({ current: 0, total: chunks.length });

        const generateAndQueue = async () => {
            console.log(`Starting AI synthesis with emotion: ${emotion} and input mode: ${inputMode}`);
            for (let i = 0; i < chunks.length; i++) {
                if (stopStreamingRef.current) break;
                
                setSynthesisProgress({ current: i + 1, total: chunks.length });
                
                // Simulate network request for each chunk
                const generatedUrl = await new Promise<string>(resolve => {
                    setTimeout(() => {
                        resolve('https://cdn.jsdelivr.net/gh/qH0sT/hello-world-audio/assets/en-us/hello-world.mp3');
                    }, 800 + Math.random() * 500);
                });

                if (stopStreamingRef.current) break;

                if (i === 0) {
                    setDownloadableAudioUrl(generatedUrl);
                    setIsLoadingAI(false);
                    setIsPlayingAI(true);
                    
                    const selectedVoice = aiVoices.find(v => v.voiceURI === selectedAIVoiceURI);
                    const historyText = inputMode === 'ssml' ? '[SSML Input]' : (text.length > 100 ? text.substring(0, 97) + '...' : text);
                    const newHistoryItem: HistoryItem = {
                        id: new Date().toISOString(),
                        text: historyText,
                        voiceName: selectedVoice?.name || 'Unknown AI Voice',
                        audioUrl: generatedUrl,
                        timestamp: Date.now(),
                        format: downloadFormat,
                        engine: 'ai'
                    };
                    const newHistory = [newHistoryItem, ...history].slice(0, 50);
                    setHistory(newHistory);
                    localStorage.setItem('tts_history', JSON.stringify(newHistory));
                }
                setAudioQueue(prev => [...prev, generatedUrl]);
            }
        };

        generateAndQueue();
    };

    // This effect manages the sequential playback of the audio queue and player state
    useEffect(() => {
        if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);

        if (!isPlayingAI || currentQueueIndex >= audioQueue.length) {
            if (audioRef.current) {
                audioRef.current.onended = null;
                audioRef.current = null;
            }
            if(isPlayingAI && currentQueueIndex >= audioQueue.length) {
                if (synthesisProgress?.current === synthesisProgress?.total) {
                     setIsPlayingAI(false);
                }
            }
            return;
        }
        
        const audio = new Audio(audioQueue[currentQueueIndex]);
        audioRef.current = audio;
        
        audio.play().catch(err => {
            console.error("Audio playback failed:", err);
            handleAIStop();
        });

        audio.onloadedmetadata = () => {
            setChunkDurations(prev => {
                const newDurations = [...prev];
                newDurations[currentQueueIndex] = audio.duration;
                return newDurations;
            });
        };
        
        const updatePlayerTime = () => {
            if (audioRef.current) {
                const playedChunksDuration = chunkDurations.slice(0, currentQueueIndex).reduce((acc, dur) => acc + (isFinite(dur) ? dur : 0), 0);
                setPlayerCurrentTime(playedChunksDuration + audioRef.current.currentTime);
            }
        };

        timeUpdateIntervalRef.current = window.setInterval(updatePlayerTime, 250);

        audio.onended = () => {
            setCurrentQueueIndex(i => i + 1);
        };
    }, [isPlayingAI, currentQueueIndex, audioQueue, synthesisProgress, chunkDurations]);
    
    const playAIAudioFromHistory = (url: string) => {
        handleStop();
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(err => console.error("Audio playback failed:", err));
        setIsPlayingAI(true);
        // This is a simplified player for history items
        audio.onloadedmetadata = () => setEstimatedTotalDuration(audio.duration);
        timeUpdateIntervalRef.current = window.setInterval(() => {
            if (audioRef.current) setPlayerCurrentTime(audioRef.current.currentTime);
        }, 250);
        audio.onended = () => {
            handleAIStop();
        };
    };

    const handlePrimaryAction = () => {
        if (engine === 'browser') {
            if (isSpeaking) {
                isPaused ? resume() : pause();
            } else {
                handleBrowserSpeak();
            }
        } else {
            if (isPlayingAI || isLoadingAI) {
                handleAIStop();
            } else {
                handleAIStream();
            }
        }
    };
    
    const handleStop = () => {
        engine === 'browser' ? cancel() : handleAIStop();
    };
    
    const toggleFavorite = (voiceURI: string) => {
        const newFavorites = favoriteVoices.includes(voiceURI)
            ? favoriteVoices.filter(v => v !== voiceURI)
            : [...favoriteVoices, voiceURI];
        setFavoriteVoices(newFavorites);
        localStorage.setItem('tts_favorite_voices', JSON.stringify(newFavorites));
    };
    
    const filteredVoices = useMemo(() => {
        const currentVoices = engine === 'browser' ? voices : aiVoices;
        return currentVoices.filter(v => {
            const langMatch = languageFilter === 'all' || v.lang.startsWith(languageFilter);
            const genderMatch = genderFilter === 'all' || ('gender' in v && v.gender === genderFilter);
            return langMatch && genderMatch;
        });
    }, [engine, voices, languageFilter, genderFilter]);

    const primaryButtonText = () => {
        if (engine === 'browser') {
            if (isPreparing) return <><SpinnerIcon /> Preparing...</>;
            if (isSpeaking) return isPaused ? <><PlayIcon /> Resume</> : <><PauseIcon/> Pause</>;
            return <><PlayIcon /> Speak</>;
        }
        if (isLoadingAI) {
            const progress = synthesisProgress ? `(${synthesisProgress.current}/${synthesisProgress.total})` : '';
            return <><SpinnerIcon /> Synthesizing {progress}</>;
        }
        if (isPlayingAI) return <><StopIcon /> Stop</>;
        return <><PlayIcon /> Speak</>;
    };

    const allVoices = engine === 'browser' ? voices : aiVoices;
    const showPlayer = engine === 'ai' && (isPlayingAI || isLoadingAI || downloadableAudioUrl);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center font-sans p-4">
            <div className="w-full max-w-3xl mx-auto">
                <Header />
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="bg-gray-800 rounded-b-lg shadow-2xl p-6">
                    {activeTab === 'synthesizer' && (
                        <div className="space-y-6">
                            {engine === 'ai' && <InputModeSwitcher mode={inputMode} setMode={setInputMode} disabled={isBusy} />}
                            <div className="relative">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={inputMode === 'ssml' ? SSML_PLACEHOLDER : PLAIN_TEXT_PLACEHOLDER}
                                    className="w-full h-48 p-4 bg-gray-900 border-2 border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-y text-lg"
                                    aria-label="Text to synthesize"
                                />
                                {engine === 'ai' && inputMode === 'text' && text && (
                                    <div className="absolute bottom-3 right-3 text-xs bg-gray-900/70 text-gray-400 px-2 py-1 rounded">
                                        Estimated duration: ~{new Date(estimatedTotalDuration * 1000).toISOString().substr(14, 5)}
                                    </div>
                                )}
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <EngineSelector selectedEngine={engine} onChange={setEngine} disabled={isBusy} />
                                    <VoiceFilters voices={allVoices} setLanguageFilter={setLanguageFilter} setGenderFilter={setGenderFilter} engine={engine} />
                                    <VoiceSelector 
                                        voices={filteredVoices}
                                        selectedValue={engine === 'browser' ? selectedBrowserVoiceURI : selectedAIVoiceURI}
                                        onChange={engine === 'browser' ? setSelectedBrowserVoiceURI : setSelectedAIVoiceURI}
                                        disabled={isBusy}
                                        favorites={favoriteVoices}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                </div>

                                <div className="space-y-4">
                                   {engine === 'browser' ? (
                                    <>
                                        <ControlDropdown
                                            label="Intonation"
                                            value={browserIntonation}
                                            onChange={(val) => setBrowserIntonation(val as BrowserIntonation)}
                                            options={[
                                                { label: 'Neutral', value: 'neutral' },
                                                { label: 'Happy', value: 'happy' },
                                                { label: 'Sad', value: 'sad' },
                                            ]}
                                            disabled={isSpeaking}
                                        />
                                        <div className="text-xs text-gray-500 text-center">
                                            Intonation presets adjust Rate ({rate.toFixed(2)}) and Pitch ({pitch.toFixed(2)}) for you.
                                        </div>
                                        <ControlSlider label="Volume" value={volume} onChange={setVolume} min={0} max={1} step={0.1} disabled={isSpeaking} />
                                        <ControlSlider label="Sentence Pause (s)" value={sentencePause} onChange={setSentencePause} min={0} max={2} step={0.1} disabled={isSpeaking} />
                                    </>
                                   ) : (
                                    <div className="space-y-4">
                                        <ControlDropdown
                                            label="Emotion"
                                            value={emotion}
                                            onChange={(val) => setEmotion(val as Emotion)}
                                            options={[
                                                { label: 'Neutral', value: 'neutral' },
                                                { label: 'Happy', value: 'happy' },
                                                { label: 'Sad', value: 'sad' },
                                            ]}
                                            disabled={isBusy || inputMode === 'ssml'}
                                        />
                                        <div className="h-full flex items-center justify-center bg-gray-900/50 rounded-lg p-4 text-center">
                                            {inputMode === 'ssml' ? (
                                                 <p className="text-gray-400 text-sm">Emotion is controlled via SSML tags.</p>
                                            ) : (
                                                <p className="text-gray-400 text-sm">Rate, pitch, and volume are pre-set by the AI for optimal quality.</p>
                                            )}
                                        </div>
                                    </div>
                                   )}
                                </div>
                            </div>
                            
                            {showPlayer && (
                                <AudioPlayer
                                    currentTime={playerCurrentTime}
                                    duration={estimatedTotalDuration}
                                    isPlaying={isPlayingAI}
                                />
                            )}

                            <div className="flex items-center justify-center flex-wrap gap-4 pt-4">
                                <ActionButton onClick={handlePrimaryAction} disabled={!text || isDownloadingBrowser} className={`px-6 py-3 text-lg font-bold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${(isSpeaking && !isPaused) || isPlayingAI || isLoadingAI ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}>
                                    {primaryButtonText()}
                                </ActionButton>
                                
                                <ActionButton onClick={handleStop} disabled={!isSpeaking && !isPlayingAI && !isPaused && !isLoadingAI} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-900/50 px-6 py-3 text-lg font-bold rounded-full">
                                   <StopIcon /> Stop
                                </ActionButton>

                                <div className="flex items-stretch">
                                    {engine === 'browser' ? (
                                        <ActionButton onClick={handleBrowserDownload} disabled={!text || isBusy} className="bg-green-600 hover:bg-green-700 focus:ring-green-500 rounded-l-full px-6 py-3 text-lg font-bold">
                                            {isDownloadingBrowser ? <SpinnerIcon /> : <DownloadIcon />} Download
                                        </ActionButton>
                                    ) : (
                                        <a href={downloadableAudioUrl || '#'} download={`ai_speech.${downloadFormat}`} role="button" aria-disabled={!downloadableAudioUrl || isLoadingAI} className={`flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold rounded-l-full transition-colors duration-200 ${!downloadableAudioUrl || isLoadingAI ? 'bg-green-900/50 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`} onClick={(e) => !downloadableAudioUrl && e.preventDefault()}>
                                            <DownloadIcon /> Download
                                        </a>
                                    )}
                                    <ControlDropdown
                                        value={downloadFormat}
                                        onChange={(val) => setDownloadFormat(val as DownloadFormat)}
                                        options={[{value: 'mp3', label: 'MP3'}, {value: 'wav', label: 'WAV'}, {value: 'ogg', label: 'OGG'}]}
                                        className="rounded-l-none rounded-r-full bg-green-700 hover:bg-green-800 focus:ring-green-600 border-l border-green-500"
                                        disabled={isBusy}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'my-voices' && <MyVoicesPanel />}
                    {activeTab === 'history' && <HistoryPanel history={history} setHistory={setHistory} playAudio={playAIAudioFromHistory} />}
                </main>
                <Footer />
            </div>
        </div>
    );
}