import { type RouteConfig, index, route , layout} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("c/:chatId", "routes/chat.tsx"), 
  ]),
] satisfies RouteConfig;
