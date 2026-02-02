import { useEffect, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface SnackbarProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
    autoHideDuration?: number;
    variant?: 'success' | 'info';
}

export default function Snackbar({
    isOpen,
    message,
    onClose,
    autoHideDuration = 3000,
    variant = 'success'
}: SnackbarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoHideDuration, onClose]);

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`
                fixed top-4 left-1/2 -translate-x-1/2 z-[9999]
                flex items-center gap-3 px-4 py-3 
                bg-[#1a1c1e] text-white rounded-xl shadow-lg
                transition-all duration-300 ease-in-out origin-top transform
                ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
            `}
        >
            <div className={`
                w-6 h-6 rounded-full flex items-center justify-center shrink-0
                ${variant === 'success' ? 'bg-[#27c08d] text-white' : 'bg-blue-500 text-white'}
            `}>
                <CheckCircle2 className="w-4 h-4" />
            </div>

            <span className="font-medium text-sm whitespace-nowrap">
                {message}
            </span>

            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="p-1 hover:bg-white/10 rounded-full transition-colors ml-2"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
