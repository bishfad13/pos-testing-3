import { useOrder } from '../../context/OrderContext';
import { Split } from 'lucide-react';

export default function SelectionFloatingBar() {
    const {
        separateSelectedItems,
        removeSelectedItems,
        selectedItemIds,
        activeGroup,
        isGroupSelectionMode,
    } = useOrder();

    // Item selection mode logic
    const selectedItems = activeGroup?.items.filter(item => selectedItemIds.has(item.id)) || [];
    const allSelectedAreCombos = selectedItems.length > 0 && selectedItems.every(item => item.subItems && item.subItems.length > 0);
    const hasSentItems = selectedItems.some(item => item.isSent);
    const allItemsSent = selectedItems.length > 0 && selectedItems.every(item => item.isSent);

    // Determine which action to show for items
    const canSeparate = allSelectedAreCombos && selectedItemIds.size > 0 && !hasSentItems;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
            <div className="bg-white flex items-center shadow-[0px_2px_8px_0px_rgba(48,49,53,0.16)] rounded-full px-4 py-2 gap-4">
                {isGroupSelectionMode ? (
                    // Group Selection Mode: Separate/Combine Fire/Hold Toggles
                    <>
                        <div className="flex items-center gap-2 px-4 py-1 text-gray-400">
                            <span className="font-semibold text-base font-['Plus_Jakarta_Sans']">
                                Group Actions
                            </span>
                        </div>
                    </>
                ) : (
                    // Item Selection Mode: Separate Items or Remove
                    <>
                        {canSeparate && (
                            <>
                                <button
                                    onClick={separateSelectedItems}
                                    className="flex items-center gap-2 px-4 py-1 rounded-lg text-[#4f54e3] hover:bg-blue-50 transition-colors"
                                >
                                    <Split className="w-5 h-5" />
                                    <span className="font-semibold text-base font-['Plus_Jakarta_Sans']">Separate</span>
                                </button>

                                {/* Divider */}
                                <div className="w-[1px] h-4 bg-gray-200" />
                            </>
                        )}

                        {/* Remove All Button */}
                        <button
                            onClick={removeSelectedItems}
                            disabled={allItemsSent}
                            className={`flex items-center gap-2 px-4 py-1 rounded-lg transition-colors
                                ${allItemsSent ? 'text-gray-300 cursor-not-allowed' : 'text-[#4f54e3] hover:bg-blue-50'}
                            `}
                        >
                            <span className="font-semibold text-base font-['Plus_Jakarta_Sans']">Remove all</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
