
import { Ticket, ChevronDown } from 'lucide-react';
import Button from './common/Button';
import { useOrder } from '../context/OrderContext';

interface BottomBarProps {
    mode?: 'default' | 'active';
}

export default function BottomBar({ mode = 'default' }: BottomBarProps) {
    const { getAllItemsSubtotal, fireToKitchen } = useOrder();

    const subtotal = getAllItemsSubtotal();
    const serviceCharge = subtotal * 0.1; // 10% service charge
    const total = subtotal + serviceCharge;

    if (mode === 'active') {
        return (
            <div className="bg-white px-6 py-4 shadow-[0_-2px_8px_rgba(48,49,53,0.16)] flex flex-col gap-4 z-20">
                {/* Simplified Subtotal */}
                <div className="bg-gray-50 rounded-lg px-4 py-2 flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Subtotal</span>
                    <span className="text-text-primary font-semibold text-sm">Rp{subtotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Fire Button - Full Width */}
                <Button
                    variant="filled"
                    size="xl"
                    block
                    onClick={fireToKitchen}
                >
                    Fire to kitchen (Rp{total.toLocaleString('id-ID')})
                </Button>
            </div>
        );
    }

    // Default Mode
    return (
        <div className="bg-white px-4 py-4 border-t border-gray-100 flex flex-col gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            {/* Promo Code Input */}
            <div className="flex gap-2 p-1 border border-orange-200 bg-orange-50/50 rounded-xl items-center pl-3">
                <Ticket className="w-5 h-5 text-orange-500" />
                <input
                    type="text"
                    placeholder="Enter promo code"
                    className="bg-transparent flex-1 text-sm font-medium focus:outline-none placeholder:text-text-secondary"
                />
                <button className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    View
                </button>
            </div>

            {/* Bill Details & Qty Grid */}
            <div className="grid grid-cols-[1fr_80px] gap-2 items-stretch">
                {/* Main Summary Box */}
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="font-semibold">Rp{subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-red-500">
                        <span className="">Discount</span>
                        <span className="font-semibold">-Rp0</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-200 cursor-pointer">
                        <div className="flex items-center gap-1 font-bold text-base">
                            <span>Total</span>
                            <ChevronDown className="w-4 h-4 text-text-primary" />
                        </div>
                        <span className="font-bold text-base">Rp{total.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Qty Box */}
                <div className="bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm text-text-primary font-medium">Qty</span>
                    <span className="text-lg font-bold">1</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-1">
                <Button variant="tonal" size="large" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                    Print bill
                </Button>
                <Button variant="filled" size="large">
                    Pay
                </Button>
            </div>
        </div>
    );
}
