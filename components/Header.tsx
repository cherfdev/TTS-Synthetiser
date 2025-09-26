
import React from 'react';
import { SpeakerWaveIcon } from './Icons';

export const Header: React.FC = () => {
    return (
        <header className="text-center mb-6">
            <div className="flex justify-center items-center gap-4">
                <SpeakerWaveIcon />
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    Advanced TTS Studio
                </h1>
            </div>
            <p className="text-gray-400 mt-2">A powerful tool to bring your text to life with natural speech.</p>
        </header>
    );
};
