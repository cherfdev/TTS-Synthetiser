
import React from 'react';
import { HistoryItem } from '../types';
import { PlayIcon, DownloadIcon, TrashIcon } from './Icons';
import { ActionButton } from './ActionButton';

interface HistoryPanelProps {
    history: HistoryItem[];
    setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
    playAudio: (url: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, setHistory, playAudio }) => {

    const deleteItem = (id: string) => {
        const newHistory = history.filter(item => item.id !== id);
        setHistory(newHistory);
        localStorage.setItem('tts_history', JSON.stringify(newHistory));
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Your generated audio will appear here.</p>
                <p className="text-sm">Only audio from the AI engine is saved to history.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {history.map(item => (
                <div key={item.id} className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-200 truncate" title={item.text}>{item.text}</p>
                        <p className="text-sm text-gray-400">
                            {item.voiceName} &bull; {new Date(item.timestamp).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                         <ActionButton onClick={() => playAudio(item.audioUrl)} aria-label="Play audio" className="p-2 rounded-full hover:bg-gray-700 text-indigo-400">
                            <PlayIcon />
                        </ActionButton>
                        <a href={item.audioUrl} download={`history_${item.timestamp}.${item.format}`} aria-label="Download audio" className="p-2 rounded-full hover:bg-gray-700 text-green-400">
                           <DownloadIcon />
                        </a>
                        <ActionButton onClick={() => deleteItem(item.id)} aria-label="Delete from history" className="p-2 rounded-full hover:bg-gray-700 text-red-400">
                           <TrashIcon />
                        </ActionButton>
                    </div>
                </div>
            ))}
        </div>
    );
};
