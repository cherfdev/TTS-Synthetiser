
import React from 'react';

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const tabItems = [
    { id: 'synthesizer', label: 'Synthesizer' },
    { id: 'my-voices', label: 'My Voices' },
    { id: 'history', label: 'History' },
];

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex border-b border-gray-700">
            {tabItems.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none -mb-px border-b-2
                        ${activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                        }`
                    }
                    role="tab"
                    aria-selected={activeTab === tab.id}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
