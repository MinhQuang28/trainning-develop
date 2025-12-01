import { type ActionFunctionArgs, redirect } from "react-router";
import { logout } from "~/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

export async function loader() {
  return redirect("/");
}