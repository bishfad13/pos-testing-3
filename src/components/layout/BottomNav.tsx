import { LayoutDashboard, Menu, Grid2X2, MoreHorizontal, ReceiptText, Zap } from 'lucide-react';
import { useState } from 'react';
import NavigationBar from '../common/NavigationBar';
import NavigationBarItem from '../common/NavigationBarItem';

export default function BottomNav() {
    const [activeTab, setActiveTab] = useState('Menu');
    const [activeAction, setActiveAction] = useState('Bill');

    return (
        <NavigationBar
            rightActions={
                <>
                    <NavigationBarItem
                        icon={<ReceiptText className="size-5" />}
                        label="Bill"
                        showIcon={false}
                        isActive={activeAction === 'Bill'}
                        onClick={() => setActiveAction('Bill')}
                    />
                    <NavigationBarItem
                        icon={<Zap className="size-5" />}
                        label="Action"
                        showIcon={false}
                        disabled={true}
                        isActive={activeAction === 'Action'}
                        onClick={() => setActiveAction('Action')}
                    />
                </>
            }
        >
            {/* Primary Nav Items */}
            <NavigationBarItem
                icon={<LayoutDashboard className="size-5" />}
                label="Dashboard"
                showIcon={false}
                disabled={true}
                isActive={activeTab === 'Dashboard'}
                onClick={() => setActiveTab('Dashboard')}
            />
            <NavigationBarItem
                icon={<Menu className="size-5" />}
                label="Menu"
                showIcon={false}
                isActive={activeTab === 'Menu'}
                onClick={() => setActiveTab('Menu')}
            />
            <NavigationBarItem
                icon={<Grid2X2 className="size-5" />}
                label="Table"
                showIcon={false}
                disabled={true}
                isActive={activeTab === 'Table'}
                onClick={() => setActiveTab('Table')}
            />

            {/* Spacer to push User and More to the end of the left section */}
            <div className="flex-1" />

            {/* User Section (at the end of left section) */}
            <NavigationBarItem
                label="Jack Johnson"
                showIcon={false}
                isActive={activeTab === 'User'}
                onClick={() => setActiveTab('User')}
            />

            {/* More Item (at the end of left section) */}
            <NavigationBarItem
                icon={<MoreHorizontal className="size-5" />}
                label="More"
                showIcon={false}
                isActive={activeTab === 'More'}
                onClick={() => setActiveTab('More')}
            />
        </NavigationBar>
    );
}
