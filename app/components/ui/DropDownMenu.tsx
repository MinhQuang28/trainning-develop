import React from "react";
import { ChevronDownIcon } from "lucide-react";
import clsx from "clsx";

type DropdownMenuItem = {
    label: string;
    value?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
    action?: () => void;
    children?: React.ReactNode
};

type DropdownMenuProps = {
    trigger?: React.ReactNode;
    items: DropdownMenuItem[];
    side?: "top" | "bottom";
    align?: "left" | "center" | "right";
    className?: string;
    menuClassName?: string;
};

const DropdownMenu = ({
    trigger,
    items,
    align = "left",
    side = "bottom",
    className,
    menuClassName
}: DropdownMenuProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={clsx("relative inline-block", className)} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer flex items-center gap-2 rounded-lg hover:bg-hover text-text-primary transition-colors"
            >
                {trigger || (
                    <>
                        Menu
                        <ChevronDownIcon
                            className={clsx(
                                "w-4 h-4 transition-transform duration-200",
                                isOpen && "rotate-180"
                            )}
                        />
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={clsx(
                        "absolute z-50 mt-2 min-w-60 rounded-lg border border-border bg-surface shadow-lg overflow-hidden",
                        align === "right" && "right-0",
                        align === "left" && "left-0",
                        align === "center" && "left-1/2 -translate-x-[43.5%]",
                        side === "bottom" ? "top-full" : "bottom-full",
                        menuClassName
                    )}
                >
                    {items.map((item, index) => (
                        <button
                            key={item.value}
                            onClick={item.action}
                            disabled={item.disabled}
                            className={clsx(
                                "cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                "hover:bg-hover focus:bg-hover focus:outline-none",
                                item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                                item.danger && "text-destructive hover:bg-red-50",
                                !item.danger && "text-text-primary",
                                index !== items.length - 1 && "border-b border-border"
                            )}
                        >
                            {item.icon && <span className="shrink-0">{item.icon}</span>}
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
