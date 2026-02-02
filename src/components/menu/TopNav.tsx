import { ChevronDown } from 'lucide-react';
import AppBar from '../common/AppBar';
import SearchInput from '../common/SearchInput';

interface TopNavProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function TopNav({ searchQuery, onSearchChange }: TopNavProps) {
    return (
        <AppBar
            title="Menu"
            variant="small"
            className="bg-transparent border-none"
        /* We use children to preserve the specific "Title + Dropdown" layout which is unique to this screen */
        /* However, strict adherence to Figma AppBar would suggest using 'title' prop. */
        /* I will try to use the 'title' prop and place the dropdown in 'trailing' or as a secondary action if possible. */
        /* But to match existing layout (Title + Home Button on left), 'children' is safest. */
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-text-primary">Menu</h1>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg font-semibold text-sm">
                        <span>Home</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative w-80">
                    <SearchInput
                        placeholder="Search menu items..."
                        variant="small"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onClear={() => onSearchChange('')}
                        /* Keeping existing width but using new component internal styling */
                        className="bg-gray-100/80"
                    />
                </div>
            </div>
        </AppBar>
    );
}
