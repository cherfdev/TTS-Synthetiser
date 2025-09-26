
import React from 'react';

type Engine = 'browser' | 'ai';

interface EngineSelectorProps {
    selectedEngine: Engine;
    onChange: (engine: Engine) => void;
    disabled?: boolean;
}

export const EngineSelector: React.FC<EngineSelectorProps> = ({ selectedEngine, onChange, disabled }) => {
    const baseClasses = "w-1/2 px-4 py-2 text-sm font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";
    const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";
    const activeClasses = "bg-indigo-600 text-white shadow-lg";

    return (
        <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Synthesizer Engine</label>
            <div className="flex rounded-lg bg-gray-900 p-1">
                <button
                    onClick={() => onChange('browser')}
                    disabled={disabled}
                    className={`${baseClasses} rounded-l-md ${selectedEngine === 'browser' ? activeClasses : inactiveClasses}`}
                    aria-pressed={selectedEngine === 'browser'}
                >
                    Browser
                </button>
                <button
                    onClick={() => onChange('ai')}
                    disabled={disabled}
                    className={`${baseClasses} rounded-r-md ${selectedEngine === 'ai' ? activeClasses : inactiveClasses}`}
                    aria-pressed={selectedEngine === 'ai'}
                >
                    AI (Backend)
                </button>
            </div>
        </div>
    );
};
