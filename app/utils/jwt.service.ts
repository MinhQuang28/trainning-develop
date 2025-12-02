import crypto from "crypto";

export function generateJWT(data: { userId: string; exp: number }): string {
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

    const signature = crypto.createHmac("sha256", process.env.JWT_SECRET_KEY as string);
    const tokenSignature = signature.update(tokenData).digest("base64url");

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

export function getUserIdFromCookies(token: string) {
    const tokenValue = token.split("=")[1];
    const tokenPayload = tokenValue.split(".")[1];
    const payload = JSON.parse(atob(tokenPayload));

    return payload.userId;
}

export function createTokens(userId: string) {
    const accessExp = Math.floor(Date.now() / 1000) + 60 * 15;
    const refreshExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

    const accessToken = generateJWT({
        userId,
        exp: accessExp
    });

    const refreshToken = generateJWT({
        userId,
        exp: refreshExp
    });

    return {
        accessToken,
        refreshToken,
        accessExp,
        refreshExp
    };
}
