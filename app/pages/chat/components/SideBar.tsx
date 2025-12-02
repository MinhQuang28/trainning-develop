import {
    BotIcon,
    LogOutIcon,
    PanelLeftCloseIcon,
    PanelRightCloseIcon,
    PenSquareIcon,
    SearchIcon
} from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import ThemeToggle from "~/components/ThemeToggle";
import { SIDE_BAR_COLLAPSE_WIDTH, SIDE_BAR_EXPANDED_WIDTH } from "~/config/constant";
import ThemeToggleCollapse from "~/components/ThemeToggleCollapse";
import { useTheme } from "~/context/ThemeProvider";
import clsx from "clsx";
import { Link, useNavigate } from "react-router";
import DropdownMenu from "~/components/ui/DropDownMenu";
import LoadingIndicator from "./LoadingIndicator";

type SideBarProps = {
    open: boolean;
    onToggle: Dispatch<SetStateAction<boolean>>;
    conversations: { id: string; title: string }[];
    activeConversationId?: string;
    userDetails: any;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    observerRef: React.RefObject<HTMLDivElement | null>;
    onLogout: () => void;
    hasMoreConversations: boolean;
    isLoading: boolean;
};

const SideBar = ({
    open = true,
    conversations = [],
    activeConversationId,
    userDetails,
    observerRef,
    scrollRef,
    hasMoreConversations,
    isLoading,
    onToggle,
    onLogout
}: SideBarProps) => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const dropdownMenuItems = [
        {
            label: "Logout",
            action: onLogout,
            icon: <LogOutIcon className="size-4 text-destructive" />
        }
    ];

    const functionItems = [
        {
            label: "New chat",
            icon: <PenSquareIcon className="size-5" />,
            action: () => navigate("/")
        },
        {
            label: "Search chats",
            icon: <SearchIcon className="size-5" />
        }
    ];

    return (
        <div
            className="h-screen max-h-screen border-r overflow-hidden border-r-border flex flex-col bg-surface transition-[width] ease-out duration-300"
            style={{ width: `${open ? SIDE_BAR_EXPANDED_WIDTH : SIDE_BAR_COLLAPSE_WIDTH}` }}
        >
            {/* Header */}
            <div
                className={`sticky top-0 flex items-center ${open ? "justify-between" : "justify-center"} px-3 pt-6`}
            >
                <span
                    className={`flex items-center gap-2 text-lg text-text-primary font-semibold ${open ? "" : "hidden"}`}
                >
                    <BotIcon className="w-8 h-8" />
                    Script
                </span>
                <button className="bg-transparent cursor-pointer" onClick={() => onToggle(!open)}>
                    {open ? (
                        <PanelLeftCloseIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                        <PanelRightCloseIcon className="w-5 h-5 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 pt-3 mt-6 min-h-0">
                <div className="px-3 flex flex-col gap-1.5">
                    {functionItems.map((item, index) => (
                        <div
                            key={index}
                            className={clsx(
                                "flex items-center cursor-pointer hover:bg-hover py-1.5 px-2.5 rounded-lg",
                                open ? "self-start gap-3 w-full " : "self-center"
                            )}
                            onClick={item.action}
                        >
                            {item.icon && <span className="shrink-0 text-text-primary">{item.icon}</span>}
                            {open && (
                                <span className="text-sm font-medium text-text-primary">{item.label}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Conversations List */}
                <div className="flex-1 min-h-0 mt-6">
                    <div ref={scrollRef} className="h-full overflow-y-auto pl-2 pr-4">
                        {open && (
                            <>
                                <p className="text-sm dark:text-text-secondary text-gray-500 ml-2 mb-2">
                                    Your chats
                                </p>
                                {conversations?.map((conversation) => (
                                    <Link to={`/${conversation.id}`} key={conversation.id}>
                                        <div
                                            className={clsx(
                                                "cursor-pointer hover:bg-hover py-1.5 px-2.5 rounded-lg text-text-primary line-clamp-1",
                                                conversation.id === activeConversationId && "bg-hover"
                                            )}
                                        >
                                            {conversation.title}
                                        </div>
                                    </Link>
                                ))}

                                {hasMoreConversations && <div ref={observerRef}></div>}

                                {isLoading && <LoadingIndicator className="mt-3" />}
                            </>
                        )}
                    </div>
                </div>

                <div className="px-3 py-3 w-full flex justify-center">
                    {open ? (
                        <ThemeToggle state={theme} className="self-end" onStateChange={setTheme} />
                    ) : (
                        <ThemeToggleCollapse state={theme} className="self-center" onStateChange={setTheme} />
                    )}
                </div>
            </div>

            {/* Footer */}
            <div
                className={`self-end border-t border-t-border py-3 hover:bg-hover cursor-pointer w-full flex items-center ${open ? "justify-start px-6 gap-3" : "justify-center"}`}
            >
                <DropdownMenu
                    items={dropdownMenuItems}
                    side="top"
                    align="center"
                    menuClassName="mb-6"
                    trigger={
                        <>
                            <img src={userDetails?.avatarUrl} className="h-8 w-8 rounded-full" alt="avatar" />
                            {open && (
                                <div className={`flex flex-col font-medium text-text-primary`}>
                                    <p className="text-sm">
                                        {userDetails.firstName} {userDetails.lastName}
                                    </p>
                                </div>
                            )}
                        </>
                    }
                />
            </div>
        </div>
    );
};

export default SideBar;
