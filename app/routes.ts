import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("./pages/chat/components/layout.tsx", [route("/:id?", "./pages/chat/chat.tsx")]),

    layout("./pages/auth/components/layout.tsx", [
        route("register", "./pages/auth/sign-up.tsx"),
        route("login", "./pages/auth/sign-in.tsx")
    ]),

    route("api/conversations", "./api/conversations.tsx"),
    route("api/messages/:id", "./api/messages.tsx"),
    route("api/logout", "./api/logout.tsx")
] satisfies RouteConfig;
