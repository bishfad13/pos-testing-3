
import { Flame, Hand } from 'lucide-react';

interface FireHoldToggleProps {
    isFired?: boolean;
    onToggle: (status: boolean) => void;
    disabled?: boolean;
}

export default function FireHoldToggle({ isFired = false, onToggle, disabled = false }: FireHoldToggleProps) {
    return (
        <div className={`flex bg-[#f2f2f2] rounded-lg p-1 gap-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {/* Hold (Hand) Button */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onToggle(false);
                }}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${!isFired
                    ? 'bg-black/16 text-gray-800 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <Hand className="w-4 h-4" />
            </div>

            {/* Fire (Flame) Button */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onToggle(true);
                }}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isFired
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <Flame className={`w-4 h-4 ${isFired ? 'fill-current' : ''}`} />
            </div>
        </div>
    );
}
