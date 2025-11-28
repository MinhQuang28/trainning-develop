import React from "react";
import Avatar from "boring-avatars";
import clsx from "clsx";
import { CheckIcon, CopyIcon } from "lucide-react";

const ChatBubble = ({ message, className }: any) => {
    const [isCopied, setIsCopied] = React.useState(false);
    const isUser = message.role === "user";

    React.useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isCopied) {
            timeout = setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [isCopied]);

    return (
        <div className={clsx("flex gap-2", className, isUser ? "self-end flex-row-reverse" : "self-start")}>
            <Avatar name="Script" variant="beam" className="h-6 w-6 place-self-end" />
            <div className="relative">
                <div
                    className={clsx(
                        "bg-gray-100 p-3 rounded-lg",
                        isUser ? "rounded-br-none" : "rounded-bl-none"
                    )}
                >
                    {message.text}
                </div>
                <div
                    className={clsx(
                        "absolute flex h-4.5 w-4.5 mt-2.5 items-center justify-center text-text-secondary hover:text-text-primary",
                        isUser ? "right-1.5" : "left-1.5"
                    )}
                >
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(message.text);
                            setIsCopied(true);
                        }}
                        disabled={isCopied}
                        className="hover:bg-hover p-1.5 rounded-md"
                    >
                        {isCopied ? (
                            <CheckIcon className="h-4.5 w-4.5 cursor-pointer" />
                        ) : (
                            <CopyIcon className="h-4.5 w-4.5 cursor-pointer" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
