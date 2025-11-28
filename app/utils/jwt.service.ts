import crypto from "crypto";

export function generateJWT(data: { userId: string }): string {
    const header = {
        type: "jwt",
        alg: "HS256"
    };

    const payload = {
        ...data
    };

    const encryptHeader = base64url(JSON.stringify(header));
    const encryptPayload = base64url(JSON.stringify(payload));
    const tokenData = `${encryptHeader}.${encryptPayload}`;

    const signature = crypto.createHmac("shad256", process.env.JWT_SECRET_KEY as string);
    const tokenSignature = signature.update(tokenData);

    return `${tokenData}.${tokenSignature}`;
}

export function verifyJWT(token: string): boolean {
    const [tokenHeader, tokenPayload, tokenSignature] = token.split(".");
    const tokenData = `${tokenHeader}.${tokenPayload}`;

    const hmac = crypto.createHmac("sha256", process.env.JWT_SECRET_KEY as string);
    const signature = hmac.update(tokenData).digest("base64url");

    return signature === tokenSignature;
}

export function base64url(data: string) {
    return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
