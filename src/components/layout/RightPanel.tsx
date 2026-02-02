import { useState, useRef } from 'react';
import TopBar from './TopBar';
import OrderGroup from './OrderGroup';
import BottomBar from '../BottomBar';
import { useOrder } from '../../context/OrderContext';
import SelectionFloatingBar from './SelectionFloatingBar';
import Snackbar from '../common/Snackbar';
import Modal from '../common/Modal';

export default function RightPanel() {
    const {
        orderGroups,
        activeGroupId,
        selectGroup,
        showSelectionError,
        discardChanges,
        hasUnsavedChanges,
        isSelectionMode,
        isGroupSelectionMode,
        fireSuccess,
        setFireSuccess
    } = useOrder();

    const [showBars, setShowBars] = useState(true);
    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
    const [showExitModal, setShowExitModal] = useState(false);
    const lastScrollY = useRef(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-hide snackbar handled in component, but we can reset state here
    const handleCloseSnackbar = () => {
        setFireSuccess(false);
    };

    const handleCloseGroup = () => {
        if (hasUnsavedChanges) {
            setShowExitModal(true);
        } else {
            selectGroup(null);
        }
    };

    const handleDiscardItems = () => {
        discardChanges();
        setShowExitModal(false);
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const currentScrollY = scrollContainerRef.current.scrollTop;
        if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setShowBars(false);
        } else {
            setShowBars(true);
        }
        lastScrollY.current = currentScrollY;
    };

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroupIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    return (
        <div className="relative h-full overflow-hidden bg-white border-l border-gray-200 shadow-xl z-20">
            {/* Top Bar - Sliding */}
            <div className={`absolute top-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out ${showBars ? 'translate-y-0' : '-translate-y-full'}`}>
                <TopBar
                    mode={activeGroupId ? 'active' : 'default'}
                    onClose={handleCloseGroup}
                />
            </div>

            {/* Scrollable Content Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`h-full overflow-y-auto px-4 flex flex-col bg-gray-50/50 transition-[padding] duration-300 ${activeGroupId ? 'pt-[80px] pb-[140px]' : 'pt-[125px] pb-[280px]'}`}
            >
                {/* Error Toast */}
                {/* Visual feedback when trying to add item without group */}
                <div className={`
                    bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 overflow-hidden
                    ${showSelectionError ? 'translate-y-0 opacity-100 max-h-20 mb-4 px-4 py-3 border border-red-200' : '-translate-y-2 opacity-0 max-h-0 mb-0 p-0 border-0'}
                `}>
                    Please select an order group first
                </div>

                {/* Order Groups List */}
                {orderGroups.map((group) => (
                    <OrderGroup
                        key={group.id}
                        group={group}
                        isExpanded={expandedGroupIds.has(group.id) || group.id === activeGroupId}
                        isActive={group.id === activeGroupId}
                        onToggle={() => toggleGroupExpansion(group.id)}
                        onSelect={() => {
                            if (group.id !== activeGroupId) {
                                selectGroup(group.id);
                                // Ensure it's expanded when selected
                                setExpandedGroupIds(prev => new Set(prev).add(group.id));
                            }
                        }}
                    />
                ))}
            </div>

            <div className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out ${showBars && !isSelectionMode && !isGroupSelectionMode ? 'translate-y-0' : 'translate-y-full'}`}>
                <BottomBar mode={activeGroupId ? 'active' : 'default'} />
            </div>

            {/* Selection Floating Bar */}
            {(isSelectionMode || isGroupSelectionMode) && <SelectionFloatingBar />}

            {/* Success Snackbar */}
            <Snackbar
                isOpen={fireSuccess}
                message="Fired to kitchen"
                onClose={handleCloseSnackbar}
            />

            {/* Exit Confirmation Modal */}
            <Modal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                title="Discard unsent items?"
                primaryAction={{
                    label: "Discard",
                    onClick: handleDiscardItems,
                    variant: "filled"
                }}
                secondaryAction={{
                    label: "Cancel",
                    onClick: () => setShowExitModal(false),
                    variant: "tonal"
                }}
            >
                You have items that haven't been sent to the kitchen. If you exit now, these items will be removed.
            </Modal>
        </div>
    );
}
