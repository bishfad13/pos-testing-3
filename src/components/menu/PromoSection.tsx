
import { useOrder } from '../../context/OrderContext';

interface PromoCardProps {
    title: string;
    price: string;
    originalPrice: string;
    onClick: () => void;
}

function PromoCard({ title, price, originalPrice, onClick }: PromoCardProps) {
    return (
        <div
            onClick={onClick}
            className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[140px] group active:scale-95"
        >
            <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">{title}</h3>
            <div>
                <span className="block text-sm text-text-secondary line-through mb-1">{originalPrice}</span>
                <span className="block text-lg font-bold text-primary">{price}</span>
            </div>
        </div>
    );
}

export default function PromoSection() {
    const { addItemToActiveGroup } = useOrder();

    const promos = [
        { title: "Kopi Panas Terbaik", price: "Rp45.000", originalPrice: "Rp35.000", numericPrice: 45000 },
        { title: "Kopi Es Spesial", price: "Rp30.000", originalPrice: "Rp40.000", numericPrice: 30000 },
        { title: "Macchiato Karamel Es", price: "Rp42.000", originalPrice: "Rp38.000", numericPrice: 42000 },
        { title: "Mocha Es Gila", price: "Rp48.000", originalPrice: "Rp36.000", numericPrice: 48000 },
    ];

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-text-primary">Promo</h2>
            <div className="grid grid-cols-3 gap-4 pb-4">
                {promos.map((promo, i) => (
                    <PromoCard
                        key={i}
                        {...promo}
                        onClick={() => addItemToActiveGroup({
                            name: promo.title,
                            price: promo.numericPrice,
                            productId: `promo-${i}`,
                            variantName: 'Medium'
                        })}
                    />
                ))}
            </div>
        </div>
    );
}
