// routes.ts
import {
  type RouteConfig,
  layout,
  route,
  index,
} from "@react-router/dev/routes";

export default [


  route("/api/register","./routes/api.register.ts"),
  route("/api/login","./routes/api.login.ts"),


  // layout("./routes/auth/layout.tsx", [
  //   route("login", "./routes/auth/login.tsx"),
  //   route("register","./routes/auth/register.tsx")
  // ]),

  // route("api/messages", "./routes/api.messages.ts"),
  
  // layout("./routes/layout.tsx", [
  //   index("./routes/home.tsx"),              
  //   route("chat/:id", "./routes/chat.$id.tsx"),
  //   route("chat/new", "./routes/chat.new.tsx"),
  // ]),
] satisfies RouteConfig;