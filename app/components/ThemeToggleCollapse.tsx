import { MoonIcon, SunIcon } from "lucide-react";
import type { Theme } from "~/context/ThemeProvider";

interface ThemeToggleCollapseProps {
    state: "light" | "dark";
    className?: string;
    onStateChange: (theme: Theme) => void;
}

const ThemeToggleCollapse = ({ state, className, onStateChange }: ThemeToggleCollapseProps) => {
    return (
        <button
            onClick={() => onStateChange(state === "light" ? "dark" : "light")}
            className={`${className} p-2 border cursor-pointer border-border rounded-lg hover:bg-hover text-text-primary transition-colors flex items-center w-fit`}
        >
            {state === "light" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
    );
};

export default ThemeToggleCollapse;
