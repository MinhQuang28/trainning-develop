import { loginUser } from "../services/auth.server";
import {signToken} from "../utils/jwt.server";

export const action = async ({ request }: { request: Request }) => {
  try {
    const data = await request.json();
    const user = await loginUser(data.email, data.password);

    const token = signToken({
        id: user.id,
        email: user.email
    });

    return Response.json({
        success: true,
        token,
        user: {
            id: user.id,
            email:user.email,
            name: user.name
        }
    });

  } catch (err: any) {
    return new Response(err.message, { status: 400 });
  }
};
