import { BotIcon, PanelLeftCloseIcon, PanelRightCloseIcon, SearchIcon } from "lucide-react";
import React, { type Dispatch, type SetStateAction } from "react";
import ThemeToggle from "~/components/ThemeToggle";
import { SIDE_BAR_COLLAPSE_WIDTH, SIDE_BAR_EXPANDED_WIDTH } from "~/config/constant";
import Avatar from "boring-avatars";
import ThemeToggleCollapse from "~/components/ThemeToggleCollapse";
import { useTheme } from "~/context/ThemeProvider";
import clsx from "clsx";
import { Link } from "react-router";

type SideBarProps = {
    open: boolean;
    onToggle: Dispatch<SetStateAction<boolean>>;
    conversations: { id: string; title: string }[];
    activeConversationId?: string;
};

const SideBar = ({ open = true, onToggle, conversations, activeConversationId }: SideBarProps) => {
    const { theme, setTheme } = useTheme();

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
            <div className="flex flex-col flex-1 pt-3 mt-6 items">
                <div className="px-3">
                    {open && (
                        <div className="relative rounded-lg h-10">
                            <input
                                type="text"
                                className="absolute w-full pl-8 pr-3 py-2 border border-border text-text-primary focus-visible:outline-border rounded-lg"
                                placeholder="Search"
                            />
                            <SearchIcon className="absolute text-gray-600 h-4.5 w-4.5 top-2.5 left-2" />
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto mt-6 flex flex-col max-h-[750px] pl-2 pr-4">
                    {open &&
                        conversations?.map((conversation) => (
                            <Link to={`/${conversation.id}`} key={conversation.id}>
                                <div
                                    key={conversation.id}
                                    className={clsx(
                                        "cursor-pointer hover:bg-hover py-1.5 px-2.5 rounded-lg text-text-primary",
                                        conversation.id === activeConversationId && "bg-hover"
                                    )}
                                >
                                    {conversation.title}
                                </div>
                            </Link>
                        ))}
                </div>
                <div className="px-3 py-3">
                    {open ? (
                        <ThemeToggle state={theme} className="self-end" onStateChange={setTheme} />
                    ) : (
                        <ThemeToggleCollapse state={theme} className="self-center" onStateChange={setTheme} />
                    )}
                </div>
            </div>

            {/* Footer */}
            <div
                className={`self-end border-t border-t-border py-3 w-full flex items-center ${open ? "justify-start px-6 gap-3" : "justify-center"}`}
            >
                <Avatar name="Nghiem Thanh Cong" variant="beam" className="h-10 w-10" />
                {open && (
                    <div className={`flex flex-col font-medium text-text-primary`}>
                        <p className="text-sm">Nghiem Thanh Cong</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SideBar;
