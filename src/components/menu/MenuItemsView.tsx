import MenuCard from './MenuCard';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
}

interface MenuItemsViewProps {
    category: string;
    items: MenuItem[];
    onBack: () => void;
    onItemClick: (item: MenuItem) => void;
}

export default function MenuItemsView({
    category,
    items,
    onBack,
    onItemClick
}: MenuItemsViewProps) {
    return (
        <div className="flex flex-col gap-6 pb-20 h-full">
            <div className="flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur z-10 py-2">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div>
                    <h2 className="text-xl font-bold text-text-primary">{category}</h2>
                    <p className="text-sm text-text-secondary">{items.length} Items</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                {items.map((item) => (
                    <MenuCard
                        key={item.id}
                        name={item.name}
                        originalPrice={item.originalPrice}
                        discountedPrice={item.price}
                        onClick={() => onItemClick(item)}
                    />
                ))}
            </div>
        </div>
    );
}
