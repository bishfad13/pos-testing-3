import { createContext, useContext, useState, type ReactNode } from 'react';

// --- Types ---
export interface OrderItem {
    id: string; // unique ID for the instance in cart
    productId: string;
    name: string;
    price: number;
    qty: number;
    variantName?: string;
    note?: string;
    subItems?: OrderItem[]; // For combos
    isFired?: boolean; // For Fire/Hold state - Intent
    isSent?: boolean; // True if physically sent to kitchen (Fired intent + Action)
    hasBeenFired?: boolean; // True only if the item has been SENT with isFired=true
}



export interface OrderGroup {
    id: string;
    name: string;
    items: OrderItem[];
    hasDistributedToggles?: boolean; // Track if fire/hold toggles are on items vs group header
    // You might track status (e.g., 'ordered', 'draft') here too
}

interface OrderContextType {
    // State
    orderGroups: OrderGroup[];
    activeGroupId: string | null;
    showSelectionError: boolean;
    showMinimumGroupError: boolean;
    isDragging: boolean;

    // Actions
    selectGroup: (groupId: string | null) => void;
    addItemToCategory: (product: Omit<OrderItem, 'id' | 'qty'>, categoryId: string) => void;
    addItemToActiveGroup: (product: Omit<OrderItem, 'id' | 'qty'>) => void;
    removeItemFromGroup: (groupId: string, itemId: string) => void;
    reorderItems: (groupId: string, activeId: string, overId: string) => void;
    setShowSelectionError: (show: boolean) => void;
    setShowMinimumGroupError: (show: boolean) => void;
    setIsDragging: (isDragging: boolean) => void;

    // Derived
    activeGroup: OrderGroup | undefined;
    hasUnsavedChanges: boolean;
    discardChanges: () => void;

    getAllItemsSubtotal: () => number;
    hasAnyCombos: () => boolean;
    // Selection Mode
    isSelectionMode: boolean;
    selectedItemIds: Set<string>;
    toggleSelectionMode: (isActive: boolean) => void;
    toggleItemSelection: (itemId: string) => void;
    toggleItemStatus: (itemId: string) => void; // New action for Fire/Hold
    removeSelectedItems: () => void;
    combineSelectedItems: () => void;
    separateSelectedItems: () => void;
    // Group Selection Mode
    isGroupSelectionMode: boolean;
    selectedGroupId: string | null;
    toggleGroupSelectionMode: (isActive: boolean, groupId?: string) => void;
    separateGroupFireHold: (groupId: string) => void;
    combineGroupFireHold: (groupId: string) => void;
    setGroupFireStatus: (groupId: string, isFired: boolean) => void;
    // Kitchen Interaction
    fireToKitchen: () => void;
    fireSuccess: boolean; // For triggering snackbar
    setFireSuccess: (success: boolean) => void;
    // Validation
    canEditGroup: (groupId: string) => boolean;
    // Scroll trigger
    lastAddedGroupId: string | null;
    clearLastAddedGroupId: () => void;
}

// --- Context ---
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// --- Provider ---
export function OrderProvider({ children }: { children: ReactNode }) {
    const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [showSelectionError, setShowSelectionError] = useState(false);
    const [showMinimumGroupError, setShowMinimumGroupError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // derive active group
    const activeGroup = orderGroups.find(g => g.id === activeGroupId);

    // Calculate subtotal of all items across all groups
    const calculateItemTotal = (item: OrderItem): number => {
        // For combo items, the price is already the total
        // For regular items, multiply price by quantity
        return item.price * item.qty;
    };

    const getAllItemsSubtotal = (): number => {
        return orderGroups.reduce((total, group) => {
            const groupTotal = group.items.reduce((sum, item) => {
                return sum + calculateItemTotal(item);
            }, 0);
            return total + groupTotal;
        }, 0);
    };

    // Check for unsaved changes - true if ANY group has items that haven't been sent to kitchen
    const hasUnsavedChanges = orderGroups.some(group =>
        group.items.some(item => !item.isSent)
    );

    // Actions
    const selectGroup = (groupId: string | null) => {
        setActiveGroupId(groupId);
        if (groupId) setShowSelectionError(false); // Clear error if selecting
    };

    const discardChanges = () => {
        // Remove unsent items from ALL groups, not just the active one
        setOrderGroups(prev => prev.map(group => {
            // Keep only items that have been sent to kitchen (isSent: true)
            // Remove all unsent items (isSent: false or undefined)
            // This preserves items that were already fired to kitchen
            // while discarding new items that haven't been submitted yet
            const sentItems = group.items.filter(item => item.isSent);

            return { ...group, items: sentItems };
        }).filter(group => group.items.length > 0)); // Remove empty groups after discarding
        selectGroup(null);
    };



    const addItemToActiveGroup = (product: Omit<OrderItem, 'id' | 'qty'>) => {
        if (!activeGroupId) {
            setShowSelectionError(true);
            return;
        }

        setOrderGroups(prev => prev.map(group => {
            if (group.id !== activeGroupId) return group;

            // Check if same product exists
            const existingItemIndex = group.items.findIndex(item =>
                item.productId === product.productId &&
                item.variantName === product.variantName &&
                item.note === product.note &&
                !item.isSent
            );

            if (existingItemIndex !== -1) {
                const newItems = [...group.items];
                const existingItem = newItems[existingItemIndex];
                newItems[existingItemIndex] = {
                    ...existingItem,
                    qty: existingItem.qty + 1
                };
                return { ...group, items: newItems };
            }

            const newItem: OrderItem = {
                ...product,
                id: Date.now().toString(),
                qty: 1,
                isFired: true // Default to Fire
            };
            return { ...group, items: [...group.items, newItem] };
        }));
    };

    const addItemToCategory = (product: Omit<OrderItem, 'id' | 'qty'>, categoryId: string) => {
        // Map category to group ID
        let targetGroupId = '';
        const catLower = categoryId.toLowerCase();

        if (catLower.includes('appetizer')) targetGroupId = 'appetizer';
        else if (catLower.includes('main')) targetGroupId = 'main';
        else if (catLower.includes('dessert')) targetGroupId = 'dessert';
        else targetGroupId = categoryId.toLowerCase().replace(/\s+/g, '-');

        // Capitalize category name for group display
        const groupName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

        // Select the group and set it as the last added group for scroll trigger
        selectGroup(targetGroupId);
        setLastAddedGroupId(targetGroupId);

        setOrderGroups(prev => {
            const groupExists = prev.some(g => g.id === targetGroupId);

            if (!groupExists) {
                // Create new group if it doesn't exist
                const newGroup: OrderGroup = {
                    id: targetGroupId,
                    name: groupName,
                    items: [{
                        ...product,
                        id: Date.now().toString(),
                        qty: 1,
                        isFired: true
                    }]
                };
                return [...prev, newGroup];
            }

            return prev.map(group => {
                if (group.id !== targetGroupId) return group;

                // Check if same product exists (productId, variantName, note)
                // BUT only combine if the existing item has NOT been sent to kitchen
                const existingItemIndex = group.items.findIndex(item =>
                    item.productId === product.productId &&
                    item.variantName === product.variantName &&
                    item.note === product.note &&
                    !item.isSent // Only combine with unsent items
                );

                if (existingItemIndex !== -1) {
                    // Increment quantity of the existing unsent item
                    const newItems = [...group.items];
                    const existingItem = newItems[existingItemIndex];
                    newItems[existingItemIndex] = {
                        ...existingItem,
                        qty: existingItem.qty + 1
                    };
                    return { ...group, items: newItems };
                }

                // Add new item (either no match found, or all matches are already sent)
                const newItem: OrderItem = {
                    ...product,
                    id: Date.now().toString(), // unique instance
                    qty: 1,
                    isFired: true // Default to Fire
                };
                return { ...group, items: [...group.items, newItem] };
            });
        });
    };

    const reorderItems = (groupId: string, activeId: string, overId: string) => {
        setOrderGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;

            const oldIndex = group.items.findIndex(i => i.id === activeId);
            const newIndex = group.items.findIndex(i => i.id === overId);

            if (oldIndex === -1 || newIndex === -1) return group;

            const newItems = [...group.items];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            return { ...group, items: newItems };
        }));
    };

    const removeItemFromGroup = (groupId: string, itemId: string) => {
        setOrderGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;

            // Prevent removing items that have already been sent to kitchen
            const itemToRemove = group.items.find(i => i.id === itemId);
            if (itemToRemove?.isSent) return group;

            const updatedItems = group.items.filter(i => i.id !== itemId);
            return {
                ...group,
                items: updatedItems
            };
        }).filter(group => group.items.length > 0)); // Remove empty groups
    };


    // --- Selection Mode State ---
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

    // --- Group Selection Mode State ---
    const [isGroupSelectionMode, setIsGroupSelectionMode] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const toggleSelectionMode = (isActive: boolean) => {
        setIsSelectionMode(isActive);
        if (!isActive) setSelectedItemIds(new Set());
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const toggleItemStatus = (itemId: string) => {
        let targetGroup: OrderGroup | undefined;
        let targetItem: OrderItem | undefined;

        for (const group of orderGroups) {
            const found = group.items.find(i => i.id === itemId);
            if (found) {
                targetGroup = group;
                targetItem = found;
                break;
            }
        }

        if (targetGroup && targetItem) {
            // Activate the group
            setActiveGroupId(targetGroup.id);

            // Toggle the status
            setOrderGroups(prev => prev.map(group => {
                if (group.id !== targetGroup!.id) return group;
                return {
                    ...group,
                    items: group.items.map(item => {
                        if (item.id === itemId) {
                            return { ...item, isFired: !item.isFired };
                        }
                        return item;
                    })
                };
            }));
        }
    };

    const setGroupFireStatus = (groupId: string, isFired: boolean) => {
        setActiveGroupId(groupId);
        setOrderGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;

            return {
                ...group,
                items: group.items.map(item => {
                    // Don't touch if finalized (hasBeenFired)
                    if (item.hasBeenFired) return item;
                    return { ...item, isFired: isFired };
                })
            };
        }));
    };

    const removeSelectedItems = () => {
        if (!activeGroupId) return;
        setOrderGroups(prev => prev.map(group => {
            if (group.id !== activeGroupId) return group;

            // Only remove items that are NOT sent to the kitchen
            return {
                ...group,
                items: group.items.filter(item => {
                    const isSelected = selectedItemIds.has(item.id);
                    // Keep the item if it's NOT selected OR if it IS selected but already SENT
                    return !isSelected || item.isSent;
                })
            };
        }).filter(group => group.items.length > 0)); // Remove empty groups
        toggleSelectionMode(false);
    };

    const combineSelectedItems = () => {
        if (selectedItemIds.size < 2) return;

        // Determine the target group. 
        // Logic: All selected items MUST belong to the SAME group.
        // We find the group that contains the first selected item.
        let targetGroupId = activeGroupId;

        if (!targetGroupId) {
            // Find the group of the first selected item
            const firstSelectedId = Array.from(selectedItemIds)[0];
            for (const group of orderGroups) {
                if (group.items.some(i => i.id === firstSelectedId)) {
                    targetGroupId = group.id;
                    break;
                }
            }
        }

        if (!targetGroupId) return;

        setOrderGroups(prev => prev.map(group => {
            if (group.id !== targetGroupId) return group;

            const itemsToCombine = group.items.filter(item => selectedItemIds.has(item.id));
            if (itemsToCombine.length < 2) return group; // Need at least 2 to combine

            const totalPrice = itemsToCombine.reduce((acc, item) => acc + (item.price * item.qty), 0);

            // Constructs a new ID
            const newId = Date.now().toString();

            const comboItem: OrderItem = {
                id: newId,
                productId: 'combo', // specific ID for combos
                name: 'Combo Group', // or generate name
                price: totalPrice,
                qty: 1, // The combo itself is 1 unit containing the others
                subItems: itemsToCombine,
                isFired: true
            };

            // Remove selected items and add the combined one
            const remainingItems = group.items.filter(item => !selectedItemIds.has(item.id));

            return {
                ...group,
                items: [...remainingItems, comboItem]
            };
        }));
        toggleSelectionMode(false);
    };

    const separateSelectedItems = () => {
        if (!activeGroupId || selectedItemIds.size === 0) return;

        setOrderGroups(prev => prev.map(group => {
            if (group.id !== activeGroupId) return group;

            // Find selected combo items
            const selectedCombos = group.items.filter(item =>
                selectedItemIds.has(item.id) && item.subItems && item.subItems.length > 0
            );

            if (selectedCombos.length === 0) return group;

            // Remove selected combos and add back their sub-items
            const remainingItems = group.items.filter(item => !selectedItemIds.has(item.id));

            // Extract all sub-items from selected combos and give them new IDs
            const separatedItems = selectedCombos.flatMap(combo =>
                combo.subItems!.map(subItem => ({
                    ...subItem,
                    id: Date.now().toString() + Math.random(), // New unique ID
                    isFired: combo.isFired // Inherit fired state from parent combo
                }))
            );

            return {
                ...group,
                items: [...remainingItems, ...separatedItems]
            };
        }));
        toggleSelectionMode(false);
    };

    const hasAnyCombos = (): boolean => {
        if (!activeGroup) return false;
        return activeGroup.items.some(item => item.subItems && item.subItems.length > 0);
    };

    const toggleGroupSelectionMode = (isActive: boolean, groupId?: string) => {
        setIsGroupSelectionMode(isActive);
        if (isActive && groupId) {
            setSelectedGroupId(groupId);
        } else {
            setSelectedGroupId(null);
        }
    };

    const separateGroupFireHold = () => {
        // Obsolete but kept for API compatibility if needed
    };

    const combineGroupFireHold = () => {
        // Obsolete but kept for API compatibility if needed
    };

    // --- Kitchen Interactions ---
    const [fireSuccess, setFireSuccess] = useState(false);

    // --- Scroll Trigger ---
    const [lastAddedGroupId, setLastAddedGroupId] = useState<string | null>(null);
    const clearLastAddedGroupId = () => setLastAddedGroupId(null);

    const fireToKitchen = () => {
        setOrderGroups(prev => {
            return prev.map((group) => {
                return {
                    ...group,
                    items: group.items.map(item => {
                        // Skip items that are already sent and have their hasBeenFired status finalized
                        if (item.isSent && (!item.isFired || item.hasBeenFired)) {
                            return item;
                        }

                        // Update both isSent and hasBeenFired based on fire intent
                        // Removed isEditable restriction - all groups can be fired if they have fire intent
                        const hasBeenFired = item.hasBeenFired || item.isFired;

                        if (!item.isSent || (item.isSent && item.isFired && !item.hasBeenFired)) {
                            return {
                                ...item,
                                isSent: true,
                                hasBeenFired: hasBeenFired
                            };
                        }
                        return item;
                    })
                };
            });
        });

        setFireSuccess(true);
        setActiveGroupId(null); // Return to Bill state after firing
    };

    // Validation
    const canEditGroup = (): boolean => {
        // All groups are now editable regardless of order
        return true;
    };

    return (
        <OrderContext.Provider value={{
            orderGroups,
            activeGroupId,
            showSelectionError,
            selectGroup,
            addItemToCategory,
            addItemToActiveGroup,
            removeItemFromGroup,
            reorderItems,
            setShowSelectionError,
            showMinimumGroupError,
            setShowMinimumGroupError,
            isDragging,
            setIsDragging,
            activeGroup,
            hasUnsavedChanges,
            discardChanges,
            getAllItemsSubtotal,
            hasAnyCombos,
            // Selection Props
            isSelectionMode,
            selectedItemIds,
            toggleSelectionMode,
            toggleItemSelection,
            toggleItemStatus,
            removeSelectedItems,
            combineSelectedItems,
            separateSelectedItems,
            // Group Selection Props
            isGroupSelectionMode,
            selectedGroupId,
            toggleGroupSelectionMode,
            separateGroupFireHold,
            combineGroupFireHold,
            // Kitchen Props
            fireToKitchen,
            fireSuccess,
            setFireSuccess,
            canEditGroup,
            lastAddedGroupId,
            clearLastAddedGroupId,
            setGroupFireStatus
        }}>
            {children}
        </OrderContext.Provider>
    );
}

// --- Hook ---
export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}
