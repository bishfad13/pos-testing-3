import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Define the interface for the AppBar component
export interface AppBarProps {
    /** The primary title of the App Bar */
    title: string;
    /** Optional secondary text */
    subtitle?: string;
    /** Optional leading icon element. defaults to back arrow if onBack is provided, or null */
    leading?: React.ReactNode;
    /** Callback for the default back button. If provided and leading is undefined, a back arrow will be shown. */
    onBack?: () => void;
    /** Trailing actions */
    trailing?: React.ReactNode;
    /** Content to display in the main area (e.g. search bar) if title/subtitle is not enough */
    children?: React.ReactNode;
    /** Size variants matching Figma v2.0 sizes */
    variant?: 'small' | 'medium' | 'large';
    /** Additional class names */
    className?: string;
}

/**
 * AppBar component based on Figma v2.0 specs.
 * 
 * Supports Small (Default), Medium, and Large variants.
 */
export default function AppBar({
    title,
    subtitle,
    leading,
    onBack,
    trailing,
    children,
    variant = 'small',
    className
}: AppBarProps) {

    // Determine the base height/padding based on variant
    // Small: Standard single row height (approx 64px)
    // Medium/Large: Taller, usually with larger title or two rows
    const variantStyles = {
        small: 'h-16 py-2',
        medium: 'h-28 py-4',
        large: 'h-32 py-6',
    };

    const isSmall = variant === 'small';

    return (
        <div className={twMerge(
            "w-full bg-surface border-b border-gray-100 px-6 flex transition-all",
            // For medium/large, we might want column layout for title, but trailing icons usually stay top right.
            // Using a grid or flex structure to handle this.
            // Current approach: Flex row for all, but align items differently.
            isSmall ? "items-center" : "flex-col justify-end pb-4",
            variantStyles[variant],
            className
        )}>
            <div className={twMerge("flex w-full items-center", isSmall ? "" : "mb-0")}>

                {/* Leading Section */}
                {(leading || onBack) && (
                    <div className="flex shrink-0 items-center mr-4">
                        {leading ? leading : (onBack ? (
                            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                            </button>
                        ) : null)}
                    </div>
                )}

                {/* Content Section (Title/Subtitle or Children) */}
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                    {children ? children : (
                        <>
                            <h1 className={twMerge(
                                "font-bold text-text-primary truncate transition-all",
                                isSmall ? "text-xl" : "text-3xl"
                            )}>
                                {title}
                            </h1>
                            {subtitle && (
                                <span className={twMerge("text-sm text-text-secondary truncate", isSmall ? "mt-0.5" : "mt-1")}>
                                    {subtitle}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Trailing Section */}
                {/* For non-small variants, trailing actions often sit at the top right, so we might need absolute positioning or a separate row. 
                    However, for this specific request, I will keep it simple: strict flex row. 
                    If the design demands top-right icons in a large header, we would need to adjust. 
                */}
                {trailing && (
                    <div className={twMerge("flex shrink-0 items-center gap-2 ml-4", isSmall ? "" : "self-start -mt-2")}>
                        {trailing}
                    </div>
                )}
            </div>
        </div>
    );
}
