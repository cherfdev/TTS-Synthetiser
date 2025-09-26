import React from 'react';

interface AudioPlayerProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
}

const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    return new Date(seconds * 1000).toISOString().substr(14, 5);
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ currentTime, duration, isPlaying }) => {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-sm font-mono text-gray-300">{formatTime(currentTime)}</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                    className="bg-indigo-500 h-2.5 rounded-full transition-all duration-150 ease-linear" 
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-sm font-mono text-gray-400">{formatTime(duration)}</span>
        </div>
    );
};
