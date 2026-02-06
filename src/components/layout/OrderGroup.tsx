import { ChevronUp, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import { type OrderGroup as OrderGroupType, useOrder } from '../../context/OrderContext';
import OrderItem from './OrderItem';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useRef } from 'react';

interface OrderGroupProps {
    group: OrderGroupType;
    isExpanded: boolean;
    isActive?: boolean;
    onToggle: () => void;
    onSelect: () => void;
}

export default function OrderGroup({ group, isExpanded, isActive = false, onToggle, onSelect }: OrderGroupProps) {
    const {
        reorderItems,
        setIsDragging,
        isGroupSelectionMode,
        selectedGroupId,
        toggleGroupSelectionMode
    } = useOrder();
    const itemCount = group.items.reduce((acc, item) => acc + item.qty, 0);

    // Long-press state for group header
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);
    const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
    const hasMoved = useRef(false);

    // Check if group is currently selected in group selection mode
    const isGroupSelected = isGroupSelectionMode && selectedGroupId === group.id;

    // Check if all items in the group are completed (sent to kitchen and fired)
    const allItemsCompleted = group.items.length > 0 && group.items.every(item => item.isSent && item.hasBeenFired);

    // --- Long Press Handlers for Group Header ---
    const handlePointerDown = (e: React.PointerEvent) => {
        if (isGroupSelectionMode) return;

        // Store initial pointer position
        pointerStartPos.current = { x: e.clientX, y: e.clientY };
        hasMoved.current = false;
        longPressTriggered.current = false;

        longPressTimer.current = setTimeout(() => {
            // Only trigger if user hasn't moved
            if (!hasMoved.current) {
                longPressTriggered.current = true;
                toggleGroupSelectionMode(true, group.id);
            }
        }, 500); // 500ms long press
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isGroupSelectionMode || !pointerStartPos.current) return;

        // Calculate distance moved
        const deltaX = Math.abs(e.clientX - pointerStartPos.current.x);
        const deltaY = Math.abs(e.clientY - pointerStartPos.current.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // If moved more than 10px, cancel long press
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

    const handleHeaderClick = () => {
        // Prevent click from firing immediately after long press
        if (longPressTriggered.current) {
            longPressTriggered.current = false;
            return;
        }
        onSelect();
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isGroupSelectionMode) return;
        toggleGroupSelectionMode(true, group.id);
    };

    // --- DND Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setIsDragging(false);
        const { active, over } = event;

        if (active.id !== over?.id) {
            reorderItems(group.id, active.id as string, over?.id as string);
        }
    };

    // --- Expanded State ---
    const renderExpanded = () => (
        <Card
            variant="outlined"
            selected={isActive || isGroupSelected}
            className={`overflow-visible transition-all shrink-0 z-10 h-auto w-full flex flex-col p-0 mb-4 rounded-2xl ${isActive || isGroupSelected ? 'border-primary' : 'border-gray-200'}`}
        >
            {/* Header */}
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onContextMenu={handleContextMenu}
                className={`w-full p-2 flex items-start justify-between transition-colors`}
            >
                <div onClick={handleHeaderClick} className="flex-1">
                    <div className="flex items-center gap-2">
                        {allItemsCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        <h3 className="text-text-primary font-semibold text-lg">{group.name}</h3>
                    </div>
                    <p className="text-text-secondary text-sm">{itemCount} items</p>
                </div>

                <div className="flex items-center gap-2">
                    <div
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-text-primary cursor-pointer hover:bg-gray-100"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className={`w-full p-2 flex flex-col min-h-[60px]`}>
                {group.items.length === 0 ? (
                    <div className="py-2 text-center text-text-secondary">No item selected</div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={group.items.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="w-full flex flex-col gap-1">
                                {group.items.map((item) => (
                                    <OrderItem
                                        key={item.id}
                                        item={item}
                                        groupId={group.id}
                                        showIndividualControls={true}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </Card>
    );

    // --- Collapsed State ---
    const renderCollapsed = () => (
        <Card
            variant="outlined"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={handleContextMenu}
            onClick={handleHeaderClick}
            selected={isActive || isGroupSelected}
            className={`p-4 flex flex-row items-center justify-between cursor-pointer transition-colors shrink-0 h-auto w-full mb-4`}
        >
            <div>
                <div className="flex items-center gap-2">
                    {allItemsCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <h3 className="text-text-primary font-semibold text-primary text-base">
                        {group.name}
                    </h3>
                </div>
                <p className="text-text-secondary text-sm">
                    {itemCount} items
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div
                    className="flex items-center justify-center rotate-180 text-text-secondary p-2 -mr-2 z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                >
                    <ChevronUp className="w-6 h-6" />
                </div>
            </div>
        </Card>
    );

    return (
        isExpanded ? renderExpanded() : renderCollapsed()
    );
}
