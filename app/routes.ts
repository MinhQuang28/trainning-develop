import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
    layout("./pages/chat/components/layout.tsx", [route("/:id?", "./pages/chat/chat.tsx")]),

    layout("./pages/auth/components/layout.tsx", [
        route("register", "./pages/auth/sign-up.tsx"),
        route("login", "./pages/auth/sign-in.tsx")
    ])
] satisfies RouteConfig;
