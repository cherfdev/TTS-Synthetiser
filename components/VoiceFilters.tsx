
import React, { useMemo } from 'react';
import type { AIVoice } from '../types';
type Voice = SpeechSynthesisVoice | AIVoice;

interface VoiceFiltersProps {
    voices: Voice[];
    setLanguageFilter: (lang: string) => void;
    setGenderFilter: (gender: 'all' | 'male' | 'female') => void;
    engine: 'browser' | 'ai';
}

export const VoiceFilters: React.FC<VoiceFiltersProps> = ({ voices, setLanguageFilter, setGenderFilter, engine }) => {
    const languages = useMemo(() => {
        const langSet = new Set(voices.map(v => v.lang.split('-')[0]));
        return Array.from(langSet).sort();
    }, [voices]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="lang-filter" className="text-sm font-medium text-gray-300 mb-1 block">Language</label>
                <select id="lang-filter" onChange={e => setLanguageFilter(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="all">All</option>
                    {languages.map(lang => (
                        <option key={lang} value={lang}>{new Intl.DisplayNames(['en'], { type: 'language' }).of(lang)}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="gender-filter" className="text-sm font-medium text-gray-300 mb-1 block">Gender</label>
                <select id="gender-filter" onChange={e => setGenderFilter(e.target.value as any)} disabled={engine === 'browser'} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="all">All</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                </select>
                 {engine === 'browser' && <p className="text-xs text-gray-500 mt-1">Gender filter is AI only.</p>}
            </div>
        </div>
    );
};
