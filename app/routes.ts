import { type RouteConfig, index, route , layout} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("c/:chatId", "routes/chat.tsx"), 
  ]),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
