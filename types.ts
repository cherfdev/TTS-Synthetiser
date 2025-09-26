export interface AIVoice {
    name: string;
    lang: string;
    voiceURI: string;
    gender: 'male' | 'female' | 'neutral';
    default?: boolean;
}

export type CustomVoice = AIVoice & { id: string; source: 'clone' | 'upload' };

export type DownloadFormat = 'mp3' | 'wav' | 'ogg';

export type Emotion = 'neutral' | 'happy' | 'sad';

export type BrowserIntonation = 'neutral' | 'happy' | 'sad';

export interface HistoryItem {
    id: string;
    text: string;
    voiceName: string;
    audioUrl: string;
    timestamp: number;
    format: DownloadFormat;
    engine: 'ai' | 'browser';
}

export type InputMode = 'text' | 'ssml';
