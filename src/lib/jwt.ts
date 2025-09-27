import * as jwt from 'jsonwebtoken';

export function generateJwtToken(userId: string): string {
    const token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: Number(process.env.JWT_LIFETIME)
    });

    return token;
}

export function verifyJwtToken(token: string): jwt.JwtPayload | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

