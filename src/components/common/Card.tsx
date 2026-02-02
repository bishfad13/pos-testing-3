import { type HTMLMotionProps, motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children?: ReactNode;
    variant?: "default" | "outlined" | "elevated";
    state?: "enabled" | "disabled" | "hovered" | "dragged" | "focused";
    selected?: boolean;
}

const variants = {
    default:
        "bg-surface border-transparent",
    outlined:
        "bg-transparent border-gray-200 border", // 1px light grey border
    elevated:
        "bg-surface shadow-md border-transparent",
};

const states = {
    enabled: "opacity-100",
    disabled: "opacity-40 pointer-events-none grayscale",
    hovered: "", // handled by framer motion whileHover
    focused: "ring-2 ring-primary",
    dragged: "z-50 shadow-2xl scale-105 cursor-grabbing",
};

export default function Card({
    children,
    className,
    variant = "default",
    state = "enabled",
    selected = false,
    ...props
}: CardProps) {
    const isSelected = selected && state !== "disabled";

    return (
        <motion.div
            className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl p-4 transition-colors duration-200",
                "w-full h-[383px]", // Default to full width to be flexible, fixed height can be overridden
                variants[variant],
                states[state],
                isSelected &&
                "border-2 border-primary bg-surface",
                !isSelected && variant === "default" && state !== "disabled" && "hover:bg-surface/90",
                // Fallback for hover if not using framer's whileHover for bg, but we will use framer for scale
                className
            )}
            initial={false}
            animate={{
                scale: state === "dragged" ? 1.05 : 1,
            }}
            whileHover={state === "enabled" && !selected ? { y: -4, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" } : {}}
            whileTap={state === "enabled" ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            {...props}
        >
            {/* Selection Overlay (optional, if design implies inner selection ring or overlay) */}

            {children || (
                <div className="flex-1 w-full min-h-0 bg-gray-100/50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-text-secondary text-sm">
                    Slot Content
                </div>
            )}
        </motion.div>
    );
}
