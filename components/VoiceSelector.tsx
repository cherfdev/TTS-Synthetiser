import React, { useState, useRef, useEffect } from 'react';
import { StarIcon, StarFilledIcon, ChevronDownIcon } from './Icons';
import type { AIVoice } from '../types';

type Voice = SpeechSynthesisVoice | AIVoice;

interface VoiceSelectorProps {
    voices: Voice[];
    selectedValue: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
    favorites: string[];
    onToggleFavorite: (voiceURI: string) => void;
}

const useOnClickOutside = (ref: React.RefObject<HTMLDivElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedValue, onChange, disabled = false, favorites, onToggleFavorite }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(dropdownRef, () => setIsOpen(false));

    const favoriteVoices = voices
        .filter(v => favorites.includes(v.voiceURI))
        .sort((a, b) => a.name.localeCompare(b.name));

    const otherVoices = voices
        .filter(v => !favorites.includes(v.voiceURI))
        .sort((a, b) => a.name.localeCompare(b.name));
    
    const selectedVoice = voices.find(v => v.voiceURI === selectedValue);

    const handleSelect = (voiceURI: string) => {
        onChange(voiceURI);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col">
            <label htmlFor="voice-select-button" className="text-sm font-medium text-gray-300 mb-1">Voice</label>
            <div className="relative" ref={dropdownRef}>
                <button
                    id="voice-select-button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled || voices.length === 0}
                    type="button"
                    className="w-full flex items-center justify-between bg-gray-700 border border-gray-600 text-white py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className="truncate">{selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : 'Select a voice'}</span>
                    <ChevronDownIcon />
                </button>
                {isOpen && (
                    <ul
                        className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        role="listbox"
                    >
                        {favoriteVoices.map((voice) => (
                            <li
                                key={voice.voiceURI}
                                className="flex items-center justify-between text-white p-2 hover:bg-indigo-600 cursor-pointer"
                                role="option"
                                aria-selected={voice.voiceURI === selectedValue}
                                onClick={() => handleSelect(voice.voiceURI)}
                            >
                                <span className="flex-grow">{`${voice.name} (${voice.lang})`}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(voice.voiceURI);
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-600"
                                    aria-label={'Remove from favorites'}
                                >
                                    <StarFilledIcon />
                                </button>
                            </li>
                        ))}

                        {favoriteVoices.length > 0 && otherVoices.length > 0 && (
                            <li role="separator"><hr className="border-gray-600 my-1 mx-2" /></li>
                        )}

                        {otherVoices.map((voice) => (
                            <li
                                key={voice.voiceURI}
                                className="flex items-center justify-between text-white p-2 hover:bg-indigo-600 cursor-pointer"
                                role="option"
                                aria-selected={voice.voiceURI === selectedValue}
                                onClick={() => handleSelect(voice.voiceURI)}
                            >
                                <span className="flex-grow">{`${voice.name} (${voice.lang})`}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(voice.voiceURI);
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-600"
                                    aria-label={'Add to favorites'}
                                >
                                    <StarIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};