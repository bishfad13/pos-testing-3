
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'filled' | 'outlined' | 'text' | 'tonal';
    size?: 'xl' | 'large' | 'main' | 'secondary';
    color?: 'primary' | 'secondary';
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    isLoading?: boolean;
    block?: boolean;
}

export default function Button({
    children,
    className = '',
    variant = 'filled',
    size = 'main',
    color = 'primary',
    leadingIcon,
    trailingIcon,
    isLoading = false,
    disabled,
    block = false,
    ...props
}: ButtonProps) {

    // --- Styles Mapping ---

    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-sans";

    const sizeStyles = {
        xl: "h-16 px-8 text-lg font-bold rounded-2xl",
        large: "h-14 px-6 text-base font-semibold rounded-2xl",
        main: "h-12 px-4 text-sm font-semibold rounded-xl",
        secondary: "h-8 px-3 text-xs font-semibold rounded-lg",
    };

    // Color definitions (using Tailwind classes / CSS variables)
    // Primary => Purple (from Design System)
    // Secondary => Black 

    const variants = {
        primary: {
            filled: "bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 border border-transparent",
            outlined: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
            tonal: "bg-primary/10 text-primary hover:bg-primary/20 border border-transparent",
            text: "bg-transparent text-primary hover:bg-primary/5 border border-transparent",
        },
        secondary: {
            filled: "bg-text-primary text-white hover:opacity-90 shadow-lg shadow-black/20 border border-transparent", // Black bg
            outlined: "bg-transparent border-2 border-text-primary text-text-primary hover:bg-text-primary/5",
            tonal: "bg-text-primary/10 text-text-primary hover:bg-text-primary/20 border border-transparent",
            text: "bg-transparent text-text-primary hover:bg-text-primary/5 border border-transparent",
        }
    };

    const selectedVariant = variants[color][variant];
    const selectedSize = sizeStyles[size];
    const widthStyle = block ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${selectedSize} ${selectedVariant} ${widthStyle} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    {leadingIcon && <span className="flex items-center">{leadingIcon}</span>}
                    {children}
                    {trailingIcon && <span className="flex items-center">{trailingIcon}</span>}
                </>
            )}
        </button>
    );
}
