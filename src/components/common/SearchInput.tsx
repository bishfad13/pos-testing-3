import React from 'react';
import { Search, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Variant size matching Figma specs */
    variant?: 'default' | 'small';
    /** Whether the input is in an error state */
    error?: boolean;
    /** Callback to clear the input */
    onClear?: () => void;
    /** Custom container class */
    containerClassName?: string;
}

/**
 * SearchInput component based on Figma specs.
 * 
 * Variants:
 * - Default: 56px height
 * - Small: 48px height
 */
export default function SearchInput({
    variant = 'default',
    error = false,
    className,
    containerClassName,
    onClear,
    disabled,
    value,
    ...props
}: SearchInputProps) {

    // Base styles
    const baseContainerStyles = "relative flex items-center w-full transition-all duration-200 rounded-xl";

    // Variant styles (Height)
    const variantStyles = {
        default: "h-14", // 56px
        small: "h-12",   // 48px
    };

    // State styles
    // Normal: bg-gray-100/80 (from existing app) or just bg-gray-100. Figma often uses a light gray surface for inputs.
    // Focused: ring-2 ring-primary/20 (assuming primary color ring)
    // Error: ring-2 ring-red-500 bg-red-50
    const stateStyles = error
        ? "bg-red-50 ring-2 ring-red-500/20"
        : disabled
            ? "bg-gray-100 opacity-60 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-sm";

    return (
        <div className={twMerge(
            baseContainerStyles,
            variantStyles[variant],
            stateStyles,
            containerClassName
        )}>
            {/* Leading Icon */}
            <div className="absolute left-4 flex items-center pointer-events-none text-text-secondary">
                <Search className={twMerge(
                    "w-5 h-5",
                    error ? "text-red-400" : "text-gray-400"
                )} />
            </div>

            {/* Input Field */}
            <input
                type="text"
                disabled={disabled}
                value={value}
                className={twMerge(
                    "w-full h-full pl-11 pr-10 bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary/60 font-medium text-base rounded-xl transition-colors",
                    className
                )}
                {...props}
            />

            {/* Trailing Icon (Clear button) */}
            {value && onClear && !disabled && (
                <button
                    onClick={onClear}
                    className="absolute right-3 p-1 rounded-full hover:bg-black/5 text-gray-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
