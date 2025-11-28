import { MoonIcon, SunIcon } from "lucide-react";
import type { Theme } from "~/context/ThemeProvider";

interface ThemeToggleProps {
    state: "light" | "dark";
    className?: string;
    onStateChange: (theme: Theme) => void;
}

const ThemeToggle = ({ state, className, onStateChange }: ThemeToggleProps) => {
    return (
        <div
            className={`${className} bg-gray-200 dark:bg-hover rounded-xl p-1.5 flex gap-2 w-full relative overflow-hidden`}
        >
            {/* Light button */}
            <div
                className="basis-1/2 text-gray-300 cursor-pointer flex rounded-lg p-1 gap-2 items-center justify-center font-medium text-sm"
                onClick={() => onStateChange("light")}
            >
                <SunIcon className="h-5 w-5" />
                Light
            </div>

            {/* Dark button */}
            <div
                className="basis-1/2 text-gray-700 cursor-pointer flex rounded-lg p-1 gap-2 items-center justify-center font-medium text-sm"
                onClick={() => onStateChange("dark")}
            >
                <MoonIcon className="h-5 w-5" />
                Dark
            </div>

            {/* Sliding highlight */}
            <div
                className={`
            bg-base text-text-primary p-1 w-[47.5%] rounded-lg absolute z-1 top-1.5 
            transition-transform duration-300 ease-in-out
            ${state === "dark" ? "translate-x-full" : "translate-x-0"}
        `}
            >
                <span className="w-full flex items-center justify-center gap-2 text-sm">
                    {state === "light" ? (
                        <>
                            <SunIcon className="h-5 w-5" />
                            Light
                        </>
                    ) : (
                        <>
                            <MoonIcon className="h-5 w-5" />
                            Dark
                        </>
                    )}
                </span>
            </div>
        </div>
    );
};

export default ThemeToggle;
