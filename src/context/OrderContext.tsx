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
    const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([
        { id: 'appetizer', name: 'Appetizer', items: [] },
        { id: 'main', name: 'Main Course', items: [] },
        { id: 'dessert', name: 'Desserts', items: [] }
    ]);
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
        }));
        selectGroup(null);
    };



    const addItemToActiveGroup = (product: Omit<OrderItem, 'id' | 'qty'>) => {
        if (!activeGroupId) {
            setShowSelectionError(true);
            return;
        }

        // Check if group is editable. If not, items default to Hold (isFired: false)
        const isEditable = canEditGroup(activeGroupId);
        const defaultFiredState = isEditable;

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
                isFired: defaultFiredState
            };
            return { ...group, items: [...group.items, newItem] };
        }));
    };

    const addItemToCategory = (product: Omit<OrderItem, 'id' | 'qty'>, categoryId: string) => {
        // Map category to group ID
        // Assuming simple mapping for now: category name -> lower case match or direct map
        // Categories: "Appetizer", "Main Course", "Desserts"
        // Groups: "appetizer", "main", "dessert"

        // This mapping logic should ideally be robust. 
        // Let's normalize inputs.
        let targetGroupId = '';
        const catLower = categoryId.toLowerCase();

        if (catLower.includes('appetizer')) targetGroupId = 'appetizer';
        else if (catLower.includes('main')) targetGroupId = 'main';
        else if (catLower.includes('dessert')) targetGroupId = 'dessert';
        else {
            // Fallback or error?
            // Determine fallback.
            targetGroupId = 'main'; // default?
        }

        // Select the group and set it as the last added group for scroll trigger
        selectGroup(targetGroupId);
        setLastAddedGroupId(targetGroupId);

        // Check if group is editable. If not, items default to Hold (isFired: false)
        const isEditable = canEditGroup(targetGroupId);
        const defaultFiredState = isEditable;

        setOrderGroups(prev => prev.map(group => {
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
                isFired: defaultFiredState // Respect validation logic
            };
            return { ...group, items: [...group.items, newItem] };
        }));
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

            return {
                ...group,
                items: group.items.filter(i => i.id !== itemId)
            };
        }));
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
        // ... existing logic ...
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

            // Only update items that can be edited (e.g. not already fired/sent and locked)
            // Actually, context handles "isFired" toggle.
            // We should just update 'isFired' for all items in the group.
            // Items that are "hasBeenFired" (finalized) shouldn't be toggleable typically?
            // But 'isFired' controls the INTENT.

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
        }));
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

        // Double check strict rule: Are ALL selected items in this group?
        // If the user managed to select items across groups (shouldn't happen in current UI), we abort or handle gracefully.
        // For now, assume single group context or we filter.

        setOrderGroups(prev => prev.map(group => {
            if (group.id !== targetGroupId) return group;

            const itemsToCombine = group.items.filter(item => selectedItemIds.has(item.id));
            if (itemsToCombine.length < 2) return group; // Need at least 2 to combine

            // Create a new "Combo" parent item
            // We'll use the first item's name/price or a generic "Combo" name?
            // User request: "from seperated coffee and milk menu item, when it click combine, it will a group which consist of coffee and milk."
            // Implicitly, this might need a new name or just use the first one + "Combo"? 
            // Or maybe just a container. Let's create a generic "Combo" wrapper for now or use the first item as lead.
            // Let's call it "Combo Group" for now or use the first item's name + " + " + others?
            // Let's just create a container item. 
            // Wait, does the container act as a real item? 
            // "it will a group which consist of coffee and milk"
            // The user implies they become one unit.
            // Let's assume the price is the sum of all parts.

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
                isFired: false
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

    const separateGroupFireHold = (groupId: string) => {
        setOrderGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, hasDistributedToggles: true };
        }));
        toggleGroupSelectionMode(false);
    };

    const combineGroupFireHold = (groupId: string) => {
        setOrderGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, hasDistributedToggles: false };
        }));
        toggleGroupSelectionMode(false);
    };

    // --- Kitchen Interactions ---
    const [fireSuccess, setFireSuccess] = useState(false);

    // --- Scroll Trigger ---
    const [lastAddedGroupId, setLastAddedGroupId] = useState<string | null>(null);
    const clearLastAddedGroupId = () => setLastAddedGroupId(null);

    const fireToKitchen = () => {
        // Fire to kitchen processes ALL groups
        // ALL unsent items get marked as isSent: true (protected from discard)
        // Only items in editable groups get their hasBeenFired status updated based on isFired

        setOrderGroups(prev => {
            // Helper to check if a group is editable based on current state
            const isGroupEditable = (groupIndex: number): boolean => {
                if (groupIndex === 0) return true; // First group always editable

                for (let i = 0; i < groupIndex; i++) {
                    const prevGroup = prev[i];

                    // Empty groups don't block
                    if (prevGroup.items.length === 0) continue;

                    // STRICT RULE: ALL items must be fired
                    const isGroupCompleted = prevGroup.items.every(item => item.hasBeenFired);
                    if (!isGroupCompleted) return false;
                }

                return true;
            };

            return prev.map((group, groupIndex) => {
                const isEditable = isGroupEditable(groupIndex);

                return {
                    ...group,
                    items: group.items.map(item => {
                        // Skip items that are already sent and have their hasBeenFired status finalized
                        if (item.isSent && (!item.isFired || item.hasBeenFired)) {
                            return item;
                        }

                        // For editable groups: update both isSent and hasBeenFired based on fire intent
                        if (isEditable) {
                            const hasBeenFired = item.hasBeenFired || item.isFired;

                            if (!item.isSent || (item.isSent && item.isFired && !item.hasBeenFired)) {
                                return {
                                    ...item,
                                    isSent: true,
                                    hasBeenFired: hasBeenFired
                                };
                            }
                            return item;
                        }

                        // For locked groups: only mark as isSent to protect from discard
                        // Do NOT update hasBeenFired - that will be done when the group becomes editable
                        if (!item.isSent) {
                            return {
                                ...item,
                                isSent: true
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
    const canEditGroup = (groupId: string): boolean => {
        // Find index
        const index = orderGroups.findIndex(g => g.id === groupId);
        if (index === -1) return false;
        if (index === 0) return true; // First group always editable

        // Check ALL previous groups
        // All previous groups must be "completed" before this one unlocks
        // A group is "completed" if it has items AND all items are fired
        for (let i = 0; i < index; i++) {
            const prevGroup = orderGroups[i];

            // NEW RULE: Empty groups do NOT block next groups.
            // If a group is empty, it's considered "skipped" rather than "blocking".
            if (prevGroup.items.length === 0) {
                continue;
            }

            // STRICT RULE: ALL items must be fired
            const isGroupCompleted = prevGroup.items.every(item => item.hasBeenFired);
            if (!isGroupCompleted) {
                return false; // Found an incomplete previous group, so current group is locked
            }
        }

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
