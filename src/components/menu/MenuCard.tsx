import Card from '../common/Card';
import React from 'react';

export default function MenuCard({
    name,
    nameContent,
    originalPrice,
    discountedPrice,
    onClick
}: {
    name: string;
    nameContent?: React.ReactNode;
    originalPrice?: number;
    discountedPrice: number;
    onClick?: () => void;
}) {
    return (
        <Card
            onClick={onClick}
            variant="elevated"
            state="enabled"
            className="flex flex-col gap-3 px-4 pt-4 pb-3 h-[127px] w-full cursor-pointer hover:border-primary/10"
            whileHover={{ y: -2, boxShadow: "0px 4px 12px rgba(0,0,0,0.08)" }} // Custom hover for small cards
        >
            {/* Product Name */}
            <h3 className="font-semibold text-sm text-[#222426] leading-[21px] tracking-[0.1px] line-clamp-3 flex-1">
                {nameContent ?? name}
            </h3>

            {/* Price Section */}
            <div className="flex flex-col gap-1">
                {originalPrice && (
                    <p className="text-xs font-normal text-[#b4b8bd] leading-[18px] tracking-[0.1px] line-through">
                        Rp{originalPrice.toLocaleString('id-ID')}
                    </p>
                )}
                <p className="text-sm font-semibold text-[#4f54e3] leading-[21px] tracking-[0.1px]">
                    Rp{discountedPrice.toLocaleString('id-ID')}
                </p>
            </div>
        </Card>
    );
}

