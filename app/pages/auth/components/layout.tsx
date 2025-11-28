import { Outlet } from "react-router";

const AuthLayout = () => {
    return (
        <div className="flex w-screen h-screen max-h-screen max-w-screen overflow-hidden">
            <Outlet />
            <div className="basis-1/2 lg:block hidden h-full bg-black self-end"></div>
        </div>
    );
};

export default AuthLayout;
