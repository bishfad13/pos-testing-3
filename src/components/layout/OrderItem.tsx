import { useRef } from 'react';
import { type OrderItem as OrderItemType, useOrder } from '../../context/OrderContext';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FireHoldToggle from '../common/FireHoldToggle';
import Card from '../common/Card';

interface OrderItemProps {
    item: OrderItemType;
    groupId: string;
    showIndividualControls?: boolean;
}

export default function OrderItem({ item, groupId }: OrderItemProps) {
    const {
        removeItemFromGroup,
        isSelectionMode,
        toggleSelectionMode,
        toggleItemSelection,
        selectedItemIds,
        toggleItemStatus,
        canEditGroup
    } = useOrder();

    const isSelected = selectedItemIds.has(item.id);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);
    const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
    const hasMoved = useRef(false);

    // Derived States
    const isFiredFinal = item.isSent && item.isFired;

    // Interactive if not fired yet.
    // ALSO: if group is locked (not editable), we shouldn't allow interactions? 
    // Wait, requirement: "fire/toggle ... is disabled ... default action is hold".
    // If not editable, it defaults to Hold (we set that in OrderContext).
    // User sees it as Hold. Toggles disabled.
    // Can they delete? "they cannot fire the group".
    // Probably shouldn't be able to delete/edit locked items until previous group is fired?
    // "the group can no longer be create and delete" -> applies to Groups.
    // Items? Usually you can remove items if you mistakenly added them.
    // But if you can't edit the group... can you remove items? 
    // Let's assume removal is allowed, but changing status is not.

    const isEditable = canEditGroup();
    // Interactive: Not fired (sent & fired). If hasBeenFired, it's totally locked.
    const isInteractive = !item.hasBeenFired;

    // --- Sortable Setup ---
    const {
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({
        id: item.id,
        disabled: true // Drag reordering disabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isSortableDragging ? 50 : 'auto',
        opacity: isSortableDragging ? 0.3 : 1,
    };

    // --- Interaction Handlers ---
    const handlePointerDown = (e: React.PointerEvent) => {
        // If hasBeenFired, we don't allow ANY interaction that starts selection or drag
        if (isSelectionMode || !isInteractive || item.hasBeenFired) return;

        const target = e.target as HTMLElement;
        const isDragHandle = target.closest('.drag-handle');
        if (isDragHandle) return;

        pointerStartPos.current = { x: e.clientX, y: e.clientY };
        hasMoved.current = false;
        longPressTriggered.current = false;

        longPressTimer.current = setTimeout(() => {
            if (!hasMoved.current) {
                longPressTriggered.current = true;
                toggleSelectionMode(true);
                toggleItemSelection(item.id);
            }
        }, 500);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isSelectionMode || !pointerStartPos.current) return;
        const deltaX = Math.abs(e.clientX - pointerStartPos.current.x);
        const deltaY = Math.abs(e.clientY - pointerStartPos.current.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 10) {
            hasMoved.current = true;
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
    };

    const handlePointerUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        pointerStartPos.current = null;
        hasMoved.current = false;
    };

    const handleItemClick = () => {
        if (longPressTriggered.current) {
            longPressTriggered.current = false;
            return;
        }
        if (isSelectionMode) {
            // Cannot select if fired
            if (item.hasBeenFired) return;
            toggleItemSelection(item.id);
        }
    };

    // --- Swipe Logic ---
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-50, -100], [0, 1]); // Show delete text as we swipe
    const bgOpacity = useTransform(x, [0, -100], [0, 1]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (!isInteractive) return;

        // Disable swipe delete if item is sent to kitchen
        if (item.isSent) return;

        if (info.offset.x < -100) {
            removeItemFromGroup(groupId, item.id);
        }
    };

    const isCombo = item.subItems && item.subItems.length > 0;

    // Determine if toggle should be shown
    // Individual toggles are now ALWAYS shown if the item hasn't been fired (sent & fired).
    const showToggle = !isSelectionMode && !item.hasBeenFired;

    return (
        <div ref={setNodeRef} style={style} className="relative w-full group overflow-hidden rounded-lg touch-none">
            {/* Delete Underlay */}
            <motion.div
                style={{ opacity: bgOpacity }}
                className="absolute inset-0 bg-red-500 rounded-lg flex items-center justify-end pr-4 text-white z-0"
            >
                <motion.div style={{ opacity }} className="flex items-center gap-2 font-bold">
                    <span>Remove</span>
                    <Trash2 className="w-5 h-5" />
                </motion.div>
            </motion.div>

            {/* Order Content Overlay */}
            <Card
                drag={isSelectionMode || !isInteractive || item.isSent ? false : "x"}
                dragConstraints={{ left: -1000, right: 0 }}
                dragElastic={0.1}
                dragSnapToOrigin
                onDragEnd={handleDragEnd}
                style={{ x }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleItemClick}
                selected={isSelected}
                state={isSelectionMode && item.hasBeenFired ? "disabled" : "enabled"}
                className={`
                    relative w-full p-2 z-10 flex h-auto flex-row items-start gap-2 rounded-lg transition-transform duration-200
                    ${isSelectionMode ? (item.hasBeenFired ? 'opacity-50' : 'cursor-pointer') : ''}
                    ${!isInteractive ? 'bg-gray-50/60' : ''} 
                `}
            >
                {/* Drag Handle OR Checkbox OR Status Icon */}
                <div className={`mt-1 transition-all duration-200 ${isSelectionMode ? 'opacity-100' : ''}`}>
                    {isSelectionMode ? (
                        item.hasBeenFired ? (
                            <div className="flex items-center justify-center w-5 h-5">
                                <CheckCircle2 className="w-4 h-4 text-gray-400" />
                            </div>
                        ) : (
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                                {isSelected && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white rotate-[-45deg] mb-0.5" />}
                            </div>
                        )
                    ) : (
                        // If interactive, show drag handle (on hover usually, but always here for touch?)
                        // If fired (not interactive), show Checkmark or spacer?
                        // If interactive (not sent), show drag handle
                        // If sent, show Status (Checkmark if fired, empty if hold)
                        !item.isSent ? (
                            <div className="w-5 h-5" /> // Spacer - drag handle removed
                        ) : (
                            <div className="flex items-center justify-center w-5 h-5">
                                {item.hasBeenFired ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <div className="w-4" />
                                )}
                            </div>
                        )
                    )}
                </div>

                <div className="flex-1">
                    {isCombo ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2">
                                {item.subItems?.map((subItem, index) => (
                                    <div key={subItem.id + index} className="flex justify-between items-start">
                                        <div>
                                            <span className={`font-semibold text-base ${isFiredFinal ? 'text-gray-500' : 'text-text-primary'}`}>{subItem.name}</span>
                                            {subItem.variantName && <div className="text-sm text-text-secondary">{subItem.variantName}</div>}
                                            {subItem.note && <div className="text-xs text-text-secondary italic">"{subItem.note}"</div>}
                                        </div>
                                        <div className="text-sm text-text-secondary">{subItem.qty}x</div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-1 mt-1 flex justify-between items-center">
                                <span className="text-sm font-semibold text-text-secondary">Package Total</span>
                                <span className={`font-semibold ${isFiredFinal ? 'text-gray-400' : 'text-primary'}`}>Rp{(item.price).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="flex justify-between items-start">
                                <span className={`font-semibold text-base ${isFiredFinal ? 'text-gray-500' : 'text-text-primary'}`}>{item.name}</span>
                                <span className={`font-semibold ${isFiredFinal ? 'text-gray-400' : 'text-primary'}`}>Rp{(item.price * item.qty).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="text-sm text-text-secondary mt-0.5">{item.qty}x</div>
                            {item.variantName && (
                                <div className="flex justify-between items-center text-sm text-text-secondary mt-1">
                                    <span>{item.variantName}</span>
                                    <span>Rp3.000</span>
                                </div>
                            )}
                            {item.note && <div className="text-xs text-text-secondary mt-1 italic">"{item.note}"</div>}
                        </div>
                    )}
                </div>

                {/* Right Side: Fire/Hold Toggle (Conditional) */}
                {showToggle && (
                    <div className="ml-2 flex flex-col justify-center h-full">
                        <FireHoldToggle
                            isFired={item.isFired}
                            onToggle={() => toggleItemStatus(item.id)}
                            disabled={!isEditable}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
