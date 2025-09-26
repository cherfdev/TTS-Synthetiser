
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="text-center mt-6">
            <p className="text-sm text-gray-500">
                Switch between the local <strong>Browser</strong> engine and the premium <strong>AI (Backend)</strong> engine for studio-quality voices.
            </p>
            <p className="text-xs text-gray-600 mt-1">
                AI engine features are for demonstration purposes. Browser downloads use a standard-quality public API.
            </p>
        </footer>
    );
};
