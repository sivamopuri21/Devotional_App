import prisma from '../database/prisma';
import { AuthService } from '../services/AuthService';

export class TokenRepository {
    /**
     * Store refresh token
     */
    async storeRefreshToken(
        userId: string,
        refreshToken: string,
        deviceInfo?: {
            ipAddress?: string;
            userAgent?: string;
            device?: object;
        }
    ): Promise<void> {
        const tokenHash = AuthService.hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await prisma.authToken.create({
            data: {
                userId,
                tokenHash,
                tokenType: 'REFRESH',
                ipAddress: deviceInfo?.ipAddress,
                userAgent: deviceInfo?.userAgent,
                deviceInfo: deviceInfo?.device,
                expiresAt,
            },
        });
    }

    /**
     * Validate and get token
     */
    async validateRefreshToken(refreshToken: string): Promise<{ valid: boolean; userId?: string }> {
        const tokenHash = AuthService.hashToken(refreshToken);

        const token = await prisma.authToken.findFirst({
            where: {
                tokenHash,
                tokenType: 'REFRESH',
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
        });

        if (!token) {
            return { valid: false };
        }

        return { valid: true, userId: token.userId };
    }

    /**
     * Revoke a specific token
     */
    async revokeToken(refreshToken: string, reason: string): Promise<void> {
        const tokenHash = AuthService.hashToken(refreshToken);

        await prisma.authToken.updateMany({
            where: { tokenHash },
            data: {
                revokedAt: new Date(),
                revokedReason: reason,
            },
        });
    }

    /**
     * Revoke all tokens for a user
     */
    async revokeAllUserTokens(userId: string, reason: string): Promise<number> {
        const result = await prisma.authToken.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
                revokedReason: reason,
            },
        });

        return result.count;
    }

    /**
     * Revoke tokens created before a certain date (for password change)
     */
    async revokeTokensCreatedBefore(userId: string, date: Date, reason: string): Promise<number> {
        const result = await prisma.authToken.updateMany({
            where: {
                userId,
                createdAt: { lt: date },
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
                revokedReason: reason,
            },
        });

        return result.count;
    }

    /**
     * Get active sessions count for a user
     */
    async getActiveSessionsCount(userId: string): Promise<number> {
        return prisma.authToken.count({
            where: {
                userId,
                tokenType: 'REFRESH',
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
    }
}
