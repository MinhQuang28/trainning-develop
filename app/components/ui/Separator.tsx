import clsx from "clsx";

interface SeparatorProps {
    className?: string;
    orientation?: "horizontal" | "vertical";
}

const Separator = ({ className = "", orientation = "horizontal" }: SeparatorProps) => {
    return (
        <div
            className={clsx(
                "bg-gray-300",
                className,
                orientation === "horizontal" ? "w-full h-px my-4" : "h-full w-px mx-4"
            )}
        />
    );
};

export default Separator;
