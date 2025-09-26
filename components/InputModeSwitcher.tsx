import React from 'react';
import type { InputMode } from '../types';

interface InputModeSwitcherProps {
    mode: InputMode;
    setMode: (mode: InputMode) => void;
    disabled?: boolean;
}

export const InputModeSwitcher: React.FC<InputModeSwitcherProps> = ({ mode, setMode, disabled }) => {
    const baseClasses = "w-1/2 px-4 py-2 text-sm font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
    const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";
    const activeClasses = "bg-indigo-600 text-white shadow-md";

    return (
        <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Input Mode</label>
            <div className="flex rounded-lg bg-gray-900 p-1">
                <button
                    onClick={() => setMode('text')}
                    disabled={disabled}
                    className={`${baseClasses} rounded-l-md ${mode === 'text' ? activeClasses : inactiveClasses}`}
                    aria-pressed={mode === 'text'}
                >
                    Plain Text
                </button>
                <button
                    onClick={() => setMode('ssml')}
                    disabled={disabled}
                    className={`${baseClasses} rounded-r-md ${mode === 'ssml' ? activeClasses : inactiveClasses}`}
                    aria-pressed={mode === 'ssml'}
                >
                    SSML
                </button>
            </div>
             <p className="text-xs text-gray-500 mt-1 text-center">SSML is an AI engine feature for advanced voice control.</p>
        </div>
    );
};
