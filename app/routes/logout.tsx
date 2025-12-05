import { type ActionFunctionArgs } from "react-router";
import { logout } from "lib/auth";

export async function action({ request }: ActionFunctionArgs) {
  return logout("/auth");
}

export default function LogoutRoute() {
  return null;
}
