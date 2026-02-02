import { useState, useMemo } from 'react';
import { useOrder } from '../../context/OrderContext';
import CategoriesView from './CategoriesView';
import MenuItemsView from './MenuItemsView';
import SearchResultsView from './SearchResultsView';

interface MockMenuItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
}

const MOCK_MENU: Record<string, MockMenuItem[]> = {
    'Appetizer': [
        { id: 'app_1', name: 'Caesar Salad', price: 45000, category: 'Appetizer' },
        { id: 'app_2', name: 'Garlic Bread', price: 25000, category: 'Appetizer' },
        { id: 'app_3', name: 'Calamari', price: 65000, originalPrice: 80000, category: 'Appetizer' },
        { id: 'app_4', name: 'Onion Soup', price: 35000, category: 'Appetizer' },
        { id: 'app_5', name: 'Bruschetta', price: 38000, category: 'Appetizer' },
        { id: 'app_6', name: 'Buffalo Wings', price: 55000, category: 'Appetizer' },
    ],
    'Main Course': [
        { id: 'main_1', name: 'Grilled Salmon', price: 125000, category: 'Main Course' },
        { id: 'main_2', name: 'Ribeye Steak', price: 180000, originalPrice: 220000, category: 'Main Course' },
        { id: 'main_3', name: 'Mushroom Risotto', price: 95000, category: 'Main Course' },
        { id: 'main_4', name: 'Roasted Chicken', price: 85000, category: 'Main Course' },
        { id: 'main_5', name: 'Beef Burger', price: 75000, category: 'Main Course' },
        { id: 'main_6', name: 'Spicy Korean Chicken', price: 98000, category: 'Main Course' },
        { id: 'main_7', name: 'Tom Yum Seafood', price: 88000, category: 'Main Course' },
    ],
    'Desserts': [
        { id: 'des_1', name: 'Tiramisu', price: 45000, category: 'Desserts' },
        { id: 'des_2', name: 'Cheesecake', price: 42000, category: 'Desserts' },
        { id: 'des_3', name: 'Choco Lava Cake', price: 48000, originalPrice: 55000, category: 'Desserts' },
        { id: 'des_4', name: 'Ice Cream Sundae', price: 32000, category: 'Desserts' },
        { id: 'des_5', name: 'Panna Cotta', price: 38000, category: 'Desserts' },
    ]
};

interface CategorySectionProps {
    searchQuery?: string;
    onClearSearch?: () => void;
}

export default function CategorySection({ searchQuery = '', onClearSearch }: CategorySectionProps) {
    const { addItemToCategory } = useOrder();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter menu items by search query (name only)
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return {};

        const query = searchQuery.toLowerCase().trim();
        const results: Record<string, MockMenuItem[]> = {};

        Object.entries(MOCK_MENU).forEach(([category, items]) => {
            const matchingItems = items.filter(item =>
                item.name.toLowerCase().includes(query)
            );
            if (matchingItems.length > 0) {
                results[category] = matchingItems;
            }
        });

        return results;
    }, [searchQuery]);

    const handleItemClick = (item: MockMenuItem) => {
        addItemToCategory({
            productId: item.id,
            name: item.name,
            price: item.price,
            note: '',
            variantName: ''
        }, item.category);
    };

    const handleClearSearch = () => {
        if (onClearSearch) {
            onClearSearch();
        }
    };

    // Show search results if there's a search query
    if (searchQuery.trim()) {
        return (
            <SearchResultsView
                searchQuery={searchQuery}
                results={searchResults}
                onItemClick={handleItemClick}
                onClearSearch={handleClearSearch}
            />
        );
    }

    // Show menu items for selected category
    if (selectedCategory) {
        return (
            <MenuItemsView
                category={selectedCategory}
                items={MOCK_MENU[selectedCategory] || []}
                onBack={() => setSelectedCategory(null)}
                onItemClick={handleItemClick}
            />
        );
    }

    // Show categories list
    return (
        <CategoriesView
            categories={Object.keys(MOCK_MENU)}
            onSelectCategory={setSelectedCategory}
        />
    );
}
