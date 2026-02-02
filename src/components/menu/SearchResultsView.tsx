import MenuCard from './MenuCard';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
}

interface SearchResultsViewProps {
    searchQuery: string;
    results: Record<string, MenuItem[]>;
    onItemClick: (item: MenuItem) => void;
    onClearSearch: () => void;
}

/**
 * Highlights the matching search query within the text with a yellow background.
 * Case-insensitive matching.
 */
function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (part.toLowerCase() === query.toLowerCase()) {
            return (
                <mark
                    key={index}
                    className="bg-yellow-300 text-inherit rounded-sm px-0.5"
                >
                    {part}
                </mark>
            );
        }
        return part;
    });
}

export default function SearchResultsView({
    searchQuery,
    results,
    onItemClick,
    onClearSearch
}: SearchResultsViewProps) {
    const categories = Object.keys(results);
    const totalItems = categories.reduce((sum, cat) => sum + results[cat].length, 0);

    if (totalItems === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-text-primary mb-1">No results found</h3>
                    <p className="text-sm text-text-secondary">
                        No menu items match "<span className="font-medium">{searchQuery}</span>"
                    </p>
                </div>
                <button
                    onClick={onClearSearch}
                    className="mt-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                    Clear search
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Search Results Header */}
            <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">
                    Search Results
                </h2>
                <p className="text-sm text-text-secondary">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} found for "{searchQuery}"
                </p>
            </div>

            {/* Results grouped by category */}
            {categories.map((category) => (
                <div key={category} className="flex flex-col gap-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-text-primary">{category}</h3>
                        <span className="text-sm text-text-secondary">
                            ({results[category].length} {results[category].length === 1 ? 'item' : 'items'})
                        </span>
                    </div>

                    {/* Menu Items Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {results[category].map((item) => (
                            <MenuCard
                                key={item.id}
                                name={item.name}
                                nameContent={highlightMatch(item.name, searchQuery)}
                                originalPrice={item.originalPrice}
                                discountedPrice={item.price}
                                onClick={() => onItemClick(item)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
