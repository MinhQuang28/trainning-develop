import { registerUser } from "../services/auth.server";

export const action = async ({ request }: { request: Request }) => {
  try {
    const data = await request.json();

    const user = await registerUser(data.email, data.password, data.name);

    return Response.json({ success: true, user });
  } catch (err: any) {
    return new Response(err.message, { status: 400 });
  }
};
