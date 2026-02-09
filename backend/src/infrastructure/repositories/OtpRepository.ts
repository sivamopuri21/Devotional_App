import prisma from '../database/prisma';
import { config } from '../../config';
import { AuthService } from '../services/AuthService';

export enum OtpPurpose {
    REGISTRATION = 'REGISTRATION',
    LOGIN = 'LOGIN',
    PASSWORD_RESET = 'PASSWORD_RESET',
    INVITE = 'INVITE',
}

export class OtpRepository {
    /**
     * Create OTP for a contact
     */
    async create(contact: string, purpose: OtpPurpose, userId?: string): Promise<string> {
        // Invalidate any existing OTPs for this contact/purpose
        await prisma.otpCode.updateMany({
            where: {
                contact,
                purpose,
                verifiedAt: null,
            },
            data: {
                verifiedAt: new Date(), // Mark as used
            },
        });

        // Generate new OTP
        const otp = AuthService.generateOtp();
        const codeHash = AuthService.hashOtp(otp);
        const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

        await prisma.otpCode.create({
            data: {
                userId,
                codeHash,
                purpose,
                contact,
                maxAttempts: config.otp.maxAttempts,
                expiresAt,
            },
        });

        return otp;
    }

    /**
     * Verify OTP
     */
    async verify(contact: string, otp: string, purpose: OtpPurpose): Promise<{
        valid: boolean;
        userId?: string;
        error?: string;
    }> {
        const codeHash = AuthService.hashOtp(otp);

        const otpRecord = await prisma.otpCode.findFirst({
            where: {
                contact,
                purpose,
                verifiedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            return { valid: false, error: 'OTP_EXPIRED' };
        }

        if (otpRecord.attempts >= otpRecord.maxAttempts) {
            return { valid: false, error: 'MAX_ATTEMPTS' };
        }

        if (otpRecord.codeHash !== codeHash) {
            await prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } },
            });
            return { valid: false, error: 'INVALID_OTP' };
        }

        // Mark as verified
        await prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { verifiedAt: new Date() },
        });

        return { valid: true, userId: otpRecord.userId || undefined };
    }

    /**
     * Check if can resend OTP (30 second cooldown)
     */
    async canResend(contact: string, purpose: OtpPurpose): Promise<{ canResend: boolean; retryAfter: number }> {
        const recentOtp = await prisma.otpCode.findFirst({
            where: {
                contact,
                purpose,
                createdAt: { gt: new Date(Date.now() - 30000) }, // Last 30 seconds
            },
        });

        if (recentOtp) {
            const retryAfter = Math.ceil((recentOtp.createdAt.getTime() + 30000 - Date.now()) / 1000);
            return { canResend: false, retryAfter };
        }

        return { canResend: true, retryAfter: 0 };
    }
}
