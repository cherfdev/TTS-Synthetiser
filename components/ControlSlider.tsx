
import React from 'react';

interface ControlSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    disabled?: boolean;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, onChange, min, max, step, disabled = false }) => {
    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
                <label htmlFor={label} className="text-sm font-medium text-gray-300">{label}</label>
                <span className="text-sm font-semibold text-indigo-400 bg-gray-700 px-2 py-0.5 rounded-full">{value.toFixed(1)}</span>
            </div>
            <input
                id={label}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md"
            />
        </div>
    );
};
