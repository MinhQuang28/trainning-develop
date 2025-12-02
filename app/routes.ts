import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("./pages/chat/components/layout.tsx", [route("/:id?", "./pages/chat/chat.tsx")]),

    layout("./pages/auth/components/layout.tsx", [
        route("register", "./pages/auth/sign-up.tsx"),
        route("login", "./pages/auth/sign-in.tsx")
    ]),

    route("api/v1/conversations", "./api/v1/conversations.tsx"),
    route("api/v1/messages/:id", "./api/v1/messages.tsx"),
    route("api/v1/logout", "./api/v1/logout.tsx")
] satisfies RouteConfig;
