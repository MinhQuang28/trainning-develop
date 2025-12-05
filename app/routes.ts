import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/auth", "./routes/auth.tsx"),
  route("/logout", "./routes/logout.tsx"),
  route("chat", "routes/chat.tsx", [
    route(":sessionId", "routes/chat.$sessionId.tsx"),
  ]),
] satisfies RouteConfig;
