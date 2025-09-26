
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface Option {
    value: string;
    label: string;
}

interface ControlDropdownProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    disabled?: boolean;
    className?: string;
}

const useOnClickOutside = (ref: React.RefObject<HTMLDivElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) return;
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

export const ControlDropdown: React.FC<ControlDropdownProps> = ({ label, value, onChange, options, disabled = false, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(dropdownRef, () => setIsOpen(false));
    
    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (newValue: string) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col">
            {label && <label htmlFor={`control-dropdown-${label}`} className="text-sm font-medium text-gray-300 mb-1">{label}</label>}
            <div className="relative" ref={dropdownRef}>
                <button
                    id={`control-dropdown-${label}`}
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    type="button"
                    className={`w-full flex items-center justify-between bg-gray-700 border border-gray-600 text-white py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-800 disabled:cursor-not-allowed ${className}`}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className="truncate">{selectedOption?.label}</span>
                    <ChevronDownIcon />
                </button>
                {isOpen && (
                    <ul
                        className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        role="listbox"
                    >
                        {options.map((option) => (
                            <li
                                key={option.value}
                                className="text-white p-2 hover:bg-indigo-600 cursor-pointer"
                                role="option"
                                aria-selected={option.value === value}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
