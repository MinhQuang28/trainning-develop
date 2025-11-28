import React from "react";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

const MainLayout = () => {
    const [isSideBarOpen, setIsSideBarOpen] = React.useState<boolean>(true);

    return (
        <div className="flex">
            <SideBar open={isSideBarOpen} onToggle={setIsSideBarOpen} />
            <Outlet />
        </div>
    );
};

export default MainLayout;
