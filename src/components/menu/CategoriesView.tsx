import CategoryCard from './CategoryCard';

interface CategoriesViewProps {
    categories: string[];
    onSelectCategory: (category: string) => void;
}

export default function CategoriesView({
    categories,
    onSelectCategory
}: CategoriesViewProps) {
    return (
        <div className="flex flex-col gap-6 pb-20">
            <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">Categories</h2>
                <p className="text-sm text-text-secondary">Select a category to view items</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {categories.map((category) => (
                    <CategoryCard
                        key={category}
                        name={category}
                        onClick={() => onSelectCategory(category)}
                    />
                ))}
            </div>
        </div>
    );
}
