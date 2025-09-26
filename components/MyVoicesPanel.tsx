
import React from 'react';
import type { CustomVoice } from '../types';
import { ActionButton } from './ActionButton';
import { PlayIcon, UploadIcon } from './Icons';

const myVoices: CustomVoice[] = [
    { id: 'custom-1', name: 'My Voice Clone', lang: 'en-US', voiceURI: 'custom-1', gender: 'male', source: 'clone' },
    { id: 'custom-2', name: 'Narrator Pro', lang: 'en-GB', voiceURI: 'custom-2', gender: 'female', source: 'upload' },
];


export const MyVoicesPanel: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-indigo-900/30 text-indigo-200 p-4 rounded-lg text-center">
                <h3 className="font-bold">This is a premium feature</h3>
                <p className="text-sm">Here you could upload, clone, and manage your own voices for a truly unique audio experience. This is a demonstration of how that feature would look.</p>
            </div>

            <div className="flex justify-end">
                <ActionButton 
                    onClick={() => alert("This would open an upload/cloning wizard.")}
                    className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 px-4 py-2 text-sm font-bold rounded-lg"
                >
                   <UploadIcon /> Add New Voice
                </ActionButton>
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-300">Your Custom Voices</h4>
                {myVoices.map(voice => (
                    <div key={voice.id} className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between gap-4">
                        <div>
                            <p className="font-semibold text-gray-200">{voice.name}</p>
                            <p className="text-sm text-gray-400">
                                {voice.lang} &bull; <span className="capitalize">{voice.gender}</span> &bull; Source: <span className="capitalize">{voice.source}</span>
                            </p>
                        </div>
                         <ActionButton 
                            onClick={() => alert(`Previewing voice: ${voice.name}`)}
                            aria-label={`Preview ${voice.name}`}
                            className="p-2 rounded-full hover:bg-gray-700 text-indigo-400"
                        >
                            <PlayIcon />
                        </ActionButton>
                    </div>
                ))}
            </div>
        </div>
    );
};
