import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { UserRepository, HouseholdRepository } from '../../infrastructure/repositories';

const router = Router();
const userRepository = new UserRepository();
const householdRepository = new HouseholdRepository();

/**
 * GET /users/me
 * Get current user profile
 */
router.get(
    '/me',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const user = await userRepository.findById(req.userId!);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'USER_NOT_FOUND', message: 'User not found' },
                });
            }

            const household = await householdRepository.findByUserId(req.userId!);

            res.json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified,
                    phoneVerified: user.phoneVerified,
                    createdAt: user.createdAt,
                    profile: user.profile ? {
                        fullName: user.profile.fullName,
                        displayName: user.profile.displayName,
                        avatarUrl: user.profile.avatarUrl,
                        dateOfBirth: user.profile.dateOfBirth,
                        gotra: user.profile.gotra,
                        nakshatra: user.profile.nakshatra,
                        rashi: user.profile.rashi,
                        languagePreference: user.profile.languagePreference,
                        isComplete: !!(user.profile.fullName),
                    } : null,
                    household: household ? {
                        id: household.id,
                        name: household.name,
                        role: household.members?.find(m => m.userId === req.userId)?.role,
                        memberCount: household.members?.length || 0,
                    } : null,
                },
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PATCH /users/me/profile
 * Update user profile
 */
router.patch(
    '/me/profile',
    authenticate,
    validate([
        body('fullName').optional().trim().notEmpty(),
        body('displayName').optional().trim(),
        body('dateOfBirth').optional().isISO8601(),
        body('gotra').optional().trim(),
        body('nakshatra').optional().trim(),
        body('rashi').optional().trim(),
        body('languagePreference').optional().isIn(['en', 'hi', 'te', 'ta', 'kn', 'ml']),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const updateData: any = {};
            const allowedFields = ['fullName', 'displayName', 'dateOfBirth', 'gotra', 'nakshatra', 'rashi', 'languagePreference'];

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updateData[field] = field === 'dateOfBirth'
                        ? new Date(req.body[field])
                        : req.body[field];
                }
            }

            const user = await userRepository.updateProfile(req.userId!, updateData);

            res.json({
                success: true,
                data: {
                    profile: user.profile,
                    isComplete: !!(user.profile?.fullName),
                },
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /users/me/change-password
 * Change user password
 */
router.post(
    '/me/change-password',
    authenticate,
    validate([
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
        body('logoutOtherDevices').optional().isBoolean(),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const { currentPassword, newPassword, logoutOtherDevices } = req.body;
            const { TokenRepository } = await import('../../infrastructure/repositories');
            const { AuthService } = await import('../../infrastructure/services/AuthService');

            const user = await userRepository.findByIdentifier(req.userId!);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'USER_NOT_FOUND', message: 'User not found' },
                });
            }

            const isValid = await AuthService.comparePassword(currentPassword, user.passwordHash);
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' },
                });
            }

            await userRepository.updatePassword(req.userId!, newPassword);

            let devicesLoggedOut = 0;
            if (logoutOtherDevices) {
                const tokenRepository = new TokenRepository();
                devicesLoggedOut = await tokenRepository.revokeTokensCreatedBefore(
                    req.userId!,
                    new Date(),
                    'password_change'
                );
            }

            res.json({
                success: true,
                data: { changed: true, devicesLoggedOut },
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
