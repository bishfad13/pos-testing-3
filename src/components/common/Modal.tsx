
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: ReactNode;
    primaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'filled' | 'outlined' | 'tonal' | 'text';
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'filled' | 'outlined' | 'tonal' | 'text';
    };
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    primaryAction,
    secondaryAction
}: ModalProps) {

    // Prevent scrolling behind modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Scrim */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 pt-6 pb-2">
                    <h2 className="text-xl font-bold text-text-primary text-center">
                        {title}
                    </h2>
                </div>

                {/* Content */}
                <div className="px-6 py-2 text-center text-text-secondary text-sm leading-relaxed">
                    {children}
                </div>

                {/* Footer / Actions */}
                <div className="p-6 flex gap-3">
                    {secondaryAction && (
                        <Button
                            variant={secondaryAction.variant || 'tonal'}
                            onClick={secondaryAction.onClick}
                            block
                            className="bg-gray-100 text-text-primary hover:bg-gray-200"
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                    {primaryAction && (
                        <Button
                            variant={primaryAction.variant || 'filled'}
                            onClick={primaryAction.onClick}
                            block
                        >
                            {primaryAction.label}
                        </Button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
