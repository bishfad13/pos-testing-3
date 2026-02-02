import Card from '../common/Card';

interface CategoryCardProps {
    name: string;
    onClick: () => void;
}

export default function CategoryCard({
    name,
    onClick
}: CategoryCardProps) {
    return (
        <Card
            onClick={onClick}
            variant="elevated"
            state="enabled"
            className="flex flex-col items-start justify-start p-4 h-[128px] w-full cursor-pointer hover:border-primary/20 transition-all"
            whileHover={{ y: -2, boxShadow: "0px 4px 12px rgba(0,0,0,0.08)" }}
        >
            <h3 className="font-semibold text-sm text-text-primary leading-[21px] tracking-[0.1px]">
                {name}
            </h3>
        </Card>
    );
}
