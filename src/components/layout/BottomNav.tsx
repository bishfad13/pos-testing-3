import { LayoutDashboard, Menu, Grid2X2, User, MoreHorizontal } from 'lucide-react';
import NavButton from './NavButton';
import { useState } from 'react';

export default function BottomNav() {
    const [activeTab, setActiveTab] = useState('Menu');

    return (
        <div className="w-full h-20 bg-white border-t border-gray-100 px-8 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.02)] relative z-30">
            {/* Left Section: Dashboard, Menu, Table, User, More */}
            <div className="flex items-center gap-4">
                <NavButton
                    icon={<LayoutDashboard className="w-5 h-5" />}
                    label="Dashboard"
                    isActive={activeTab === 'Dashboard'}
                    onClick={() => setActiveTab('Dashboard')}
                />
                <NavButton
                    icon={<Menu className="w-5 h-5" />}
                    label="Menu"
                    isActive={activeTab === 'Menu'}
                    onClick={() => setActiveTab('Menu')}
                />
                <NavButton
                    icon={<Grid2X2 className="w-5 h-5" />}
                    label="Table"
                    isActive={activeTab === 'Table'}
                    onClick={() => setActiveTab('Table')}
                />
                <div className="w-px h-8 bg-gray-200 mx-2" /> {/* Divider */}
                <div className="flex items-center gap-2 text-text-secondary font-medium px-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <span>Jack Johnson</span>
                </div>
                <NavButton
                    icon={<MoreHorizontal className="w-5 h-5" />}
                    label="More"
                    isActive={activeTab === 'More'}
                    onClick={() => setActiveTab('More')}
                />
            </div>

            {/* Right Section: Bill, Action */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="flex items-center gap-2 text-text-secondary hover:text-primary font-medium px-4 py-2 rounded-lg transition-colors">
                    Bill
                </button>
                <button className="flex items-center gap-2 text-primary font-bold px-4 py-2 rounded-lg transition-colors bg-primary/10">
                    Action
                </button>
            </div>
        </div>
    );
}
