
import { type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    supportingText?: string;
    characterCount?: string;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    error?: boolean;
    showCharacterCount?: boolean;
}

export default function TextField({
    className = '',
    label,
    supportingText,
    characterCount,
    leadingIcon,
    trailingIcon,
    error = false,
    disabled,
    showCharacterCount = false,
    ...props
}: TextFieldProps) {

    // Base Styles
    const baseInputStyles = "w-full h-[48px] bg-white border rounded-xl px-4 text-text-primary placeholder:text-text-secondary/50 focus:outline-none transition-all";

    // State Styles
    const stateStyles = error
        ? "border-red-500 focus:ring-1 focus:ring-red-500"
        : "border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary hover:border-gray-300";

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "";

    // Padding for icons
    const paddingLeft = leadingIcon ? "pl-11" : "pl-4";
    const paddingRight = trailingIcon ? "pr-11" : "pr-4";

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {/* Label */}
            {label && (
                <label className="text-sm font-semibold text-text-primary ml-1">
                    {label}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {leadingIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                        {leadingIcon}
                    </div>
                )}

                <input
                    className={`${baseInputStyles} ${stateStyles} ${disabledStyles} ${paddingLeft} ${paddingRight}`}
                    disabled={disabled}
                    {...props}
                />

                {trailingIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                        {trailingIcon}
                    </div>
                )}

                {error && !trailingIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Supporting Text & Counter */}
            {(supportingText || showCharacterCount) && (
                <div className="flex justify-between items-start px-1 text-xs sm:text-sm">
                    <span className={`${error ? "text-red-500" : "text-text-secondary"}`}>
                        {supportingText}
                    </span>
                    {showCharacterCount && (
                        <span className="text-text-secondary ml-auto pl-2">
                            {characterCount || `${(props.value as string)?.length || 0}/${props.maxLength || 0}`}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
