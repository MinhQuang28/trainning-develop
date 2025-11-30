// routes.ts
import {
  type RouteConfig,
  layout,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  route("api/messages", "./routes/api.messages.ts"),
  
  layout("./routes/layout.tsx", [
    index("./routes/home.tsx"),              
    route("chat/:id", "./routes/chat.$id.tsx"),
    route("chat/new", "./routes/chat.new.tsx"),
  ]),
] satisfies RouteConfig;