
import { X, Plus } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import Button from '../common/Button';

interface TopBarProps {
    mode?: 'default' | 'active';
    onClose?: () => void;
}

export default function TopBar({ mode = 'default', onClose }: TopBarProps) {
    const { isDragging, isSelectionMode, selectedItemIds, toggleSelectionMode, isGroupSelectionMode, toggleGroupSelectionMode } = useOrder();

    // Group Selection Mode - for editing group toggles
    if (isGroupSelectionMode) {
        return (
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-[0_2px_8px_rgba(48,49,53,0.16)] h-[64px] absolute inset-x-0 top-0 z-50">
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => toggleGroupSelectionMode(false)}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 active:scale-95 transition-all text-text-primary"
                    >
                        <X className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-text-primary">
                        Edit group
                    </span>
                </div>
            </div>
        );
    }

    if (isSelectionMode) {
        return (
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-[0_2px_8px_rgba(48,49,53,0.16)] h-[64px] absolute inset-x-0 top-0 z-50">
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => toggleSelectionMode(false)}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 active:scale-95 transition-all text-text-primary"
                    >
                        <X className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-text-primary">
                        Select {selectedItemIds.size} Items
                    </span>
                </div>
            </div>
        );
    }

    if (mode === 'active') {
        return (
            <div className="bg-white h-[64px] px-4 flex items-center gap-6 border-b border-gray-100 shrink-0">
                <button
                    onClick={onClose}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-6 h-6 text-text-primary" />
                </button>

                <h1 className="text-2xl font-semibold text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {isDragging ? "Move the item's order" : "A01"}
                </h1>

                {!isDragging && (
                    <div className="h-8 px-4 rounded-full border border-gray-200 flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">Dine In</span>
                    </div>
                )}
            </div>
        );
    }

    // Default Mode
    return (
        <div className="bg-white px-4 py-4 border-b border-gray-100 flex flex-col gap-4">
            {/* Title Row */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text-primary ml-1">
                    A01
                </h1>
                <span className="text-text-primary font-semibold text-sm mr-1">
                    Dine In
                </span>
            </div>

            {/* Add Customer Row */}
            <div className="border border-gray-200 rounded-xl p-2 pl-4 flex items-center justify-between">
                <span className="text-text-primary font-semibold text-sm">Add customer</span>
                <Button
                    variant="tonal"
                    color="secondary"
                    size="secondary"
                    leadingIcon={<Plus className="w-4 h-4" />}
                >
                    Add
                </Button>
            </div>
        </div>
    );
}
