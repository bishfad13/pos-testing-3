import { type ReactNode } from 'react';

interface NavButtonProps {
    icon: ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

export default function NavButton({ icon, label, isActive = false, onClick }: NavButtonProps) {
    if (isActive) {
        return (
            <button
                onClick={onClick}
                className="flex items-center gap-2 text-primary font-semibold px-4 py-2 bg-blue-50 rounded-lg transition-colors"
            >
                {icon}
                {label}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 text-text-secondary hover:text-primary font-medium px-4 py-2 rounded-lg transition-colors"
        >
            {icon}
            {label}
        </button>
    );
}
