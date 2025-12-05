import { redirect } from "react-router";

export function loader() {
  return redirect("/chat/new");
}

export default function Home() {
  return null;
}
