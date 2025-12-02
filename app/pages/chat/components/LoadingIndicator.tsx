import clsx from "clsx";
import { LoaderIcon } from "lucide-react";

type LoadingIndicatorProps = {
    className?: string;
    size?: number;
};

const LoadingIndicator = ({ className, size }: LoadingIndicatorProps) => {
    return (
        <div className={clsx("flex items-center justify-center w-full", className)}>
            <LoaderIcon className="animate-spin text-text-primary" size={size} />
        </div>
    );
};

export default LoadingIndicator;
