import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { AcceptInviteUseCase, DeclineInviteUseCase } from '../../application/usecases';
import { HouseholdRepository } from '../../infrastructure/repositories';

const router = Router();
const householdRepository = new HouseholdRepository();

const acceptInviteUseCase = new AcceptInviteUseCase(householdRepository);
const declineInviteUseCase = new DeclineInviteUseCase(householdRepository);

/**
 * GET /invites/:token
 * Get invitation details (public)
 */
router.get(
    '/:token',
    optionalAuth,
    async (req, res, next) => {
        try {
            const invite = await householdRepository.findInviteByToken(req.params.token);

            if (!invite) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'INVITE_NOT_FOUND', message: 'Invitation not found' },
                });
            }

            const household = await householdRepository.findById(invite.householdId);

            res.json({
                success: true,
                data: {
                    id: invite.id,
                    householdName: household?.name,
                    role: invite.role,
                    status: invite.status,
                    expiresAt: invite.expiresAt,
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
 * POST /invites/:token/accept
 * Accept an invitation
 */
router.post(
    '/:token/accept',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const household = await acceptInviteUseCase.execute(req.params.token, req.userId!);
            res.json({
                success: true,
                data: {
                    accepted: true,
                    household: {
                        id: household.id,
                        name: household.name,
                    },
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
 * POST /invites/:token/decline
 * Decline an invitation
 */
router.post(
    '/:token/decline',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await declineInviteUseCase.execute(req.params.token);
            res.json({
                success: true,
                data: { declined: true },
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
