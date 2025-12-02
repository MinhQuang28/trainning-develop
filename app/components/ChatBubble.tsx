import React from "react";
import Avatar from "boring-avatars";
import clsx from "clsx";
import { CheckIcon, CopyIcon } from "lucide-react";

type ChatBubbleProps = {
    message: {
        text: string;
        role: string;
        isPending?: boolean;
    };
    className: string;
    userDetails: any;
};

const ChatBubble = ({ message, className, userDetails }: ChatBubbleProps) => {
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
        <div
            className={clsx(
                "flex gap-2 animate-fade-in",
                className,
                isUser ? "self-end flex-row-reverse" : "self-start"
            )}
        >
            {isUser ? (
                <img
                    src={userDetails?.avatarUrl}
                    className="h-6 w-6 rounded-full place-self-end"
                    alt="avatar"
                />
            ) : (
                <Avatar name="Script" variant="beam" className="min-h-6 min-w-6 h-6 w-6 place-self-end" />
            )}
            <div className="relative">
                <div
                    className={clsx(
                        "bg-hover text-text-primary p-3 rounded-lg",
                        isUser ? "rounded-br-none" : "rounded-bl-none"
                    )}
                >
                    {message.isPending ? (
                        <div className="flex gap-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-[#CFD3E4] w-2.5 h-2.5 rounded-full animate-loading"
                                    style={{
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        message.text
                    )}
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
