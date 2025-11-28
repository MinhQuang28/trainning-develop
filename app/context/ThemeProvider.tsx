import React from "react";

export type Theme = "light" | "dark";

type ThemeProviderProps = {
    children: React.ReactNode;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState = {
    theme: "light" as const,
    setTheme: () => null
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = React.useState<Theme>("light");

    React.useEffect(() => {
        setTheme((localStorage.getItem("script_theme") as Theme) || "light");
    }, []);

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme: theme,
        setTheme: (theme: Theme) => {
            if (typeof window !== "undefined") {
                localStorage.setItem("script_theme", theme);
            }
            setTheme(theme);
        }
    };

    return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
};

export default ThemeProvider;

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext);

    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
