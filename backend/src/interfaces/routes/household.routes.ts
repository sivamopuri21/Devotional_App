import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import {
    CreateHouseholdUseCase,
    GetHouseholdUseCase,
    InviteMemberUseCase,
    AcceptInviteUseCase,
    DeclineInviteUseCase,
    UpdateMemberRoleUseCase,
    RemoveMemberUseCase,
    TransferHeadUseCase,
    LeaveHouseholdUseCase
} from '../../application/usecases';
import { HouseholdRepository } from '../../infrastructure/repositories';
import { HouseholdRole } from '../../domain/entities';

const router = Router();

// Initialize repositories and use cases
const householdRepository = new HouseholdRepository();

const createHouseholdUseCase = new CreateHouseholdUseCase(householdRepository);
const getHouseholdUseCase = new GetHouseholdUseCase(householdRepository);
const inviteMemberUseCase = new InviteMemberUseCase(householdRepository);
const acceptInviteUseCase = new AcceptInviteUseCase(householdRepository);
const declineInviteUseCase = new DeclineInviteUseCase(householdRepository);
const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(householdRepository);
const removeMemberUseCase = new RemoveMemberUseCase(householdRepository);
const transferHeadUseCase = new TransferHeadUseCase(householdRepository);
const leaveHouseholdUseCase = new LeaveHouseholdUseCase(householdRepository);

/**
 * POST /households
 * Create a new household
 */
router.post(
    '/',
    authenticate,
    validate([
        body('name').trim().notEmpty().withMessage('Household name is required'),
        body('address').optional().isObject(),
        body('address.line1').optional().notEmpty().withMessage('Address line 1 is required'),
        body('address.city').optional().notEmpty().withMessage('City is required'),
        body('address.state').optional().notEmpty().withMessage('State is required'),
        body('address.pincode').optional().notEmpty().withMessage('Pincode is required'),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const result = await createHouseholdUseCase.execute(req.userId!, req.body);
            res.status(201).json({
                success: true,
                data: formatHouseholdResponse(result),
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
 * GET /households/:id
 * Get household details
 */
router.get(
    '/:id',
    authenticate,
    validate([
        param('id').isUUID().withMessage('Invalid household ID'),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const result = await getHouseholdUseCase.execute(req.params.id, req.userId!);
            res.json({
                success: true,
                data: formatHouseholdResponse(result),
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
 * PATCH /households/:id
 * Update household details
 */
router.patch(
    '/:id',
    authenticate,
    validate([
        param('id').isUUID().withMessage('Invalid household ID'),
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const household = await getHouseholdUseCase.execute(req.params.id, req.userId!);

            if (household.headUserId !== req.userId) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'ACCESS_DENIED', message: 'Only head can update household' },
                });
            }

            const updated = await householdRepository.updateName(req.params.id, req.body.name);
            res.json({
                success: true,
                data: formatHouseholdResponse(updated),
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
 * POST /households/:id/invites
 * Invite a member to household
 */
router.post(
    '/:id/invites',
    authenticate,
    validate([
        param('id').isUUID().withMessage('Invalid household ID'),
        body('contact').notEmpty().withMessage('Contact is required'),
        body('role').isIn(['ADULT', 'CHILD']).withMessage('Invalid role'),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const result = await inviteMemberUseCase.execute(
                req.params.id,
                req.userId!,
                req.body.contact,
                req.body.role as HouseholdRole
            );
            res.status(201).json({
                success: true,
                data: {
                    id: result.id,
                    householdId: result.householdId,
                    inviteeContact: result.inviteeContact,
                    role: result.role,
                    status: result.status,
                    inviteLink: result.inviteLink,
                    expiresAt: result.expiresAt,
                    createdAt: result.createdAt,
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
 * GET /households/:id/invites
 * Get pending invites for household
 */
router.get(
    '/:id/invites',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await getHouseholdUseCase.execute(req.params.id, req.userId!);
            const invites = await householdRepository.getPendingInvites(req.params.id);
            res.json({
                success: true,
                data: { invites, total: invites.length },
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
 * PATCH /households/:id/members/:userId
 * Update member role
 */
router.patch(
    '/:id/members/:userId',
    authenticate,
    validate([
        param('id').isUUID().withMessage('Invalid household ID'),
        param('userId').isUUID().withMessage('Invalid user ID'),
        body('role').isIn(['ADULT', 'CHILD']).withMessage('Invalid role'),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await updateMemberRoleUseCase.execute(
                req.params.id,
                req.userId!,
                req.params.userId,
                req.body.role as HouseholdRole
            );
            res.json({
                success: true,
                data: { userId: req.params.userId, role: req.body.role, updatedAt: new Date() },
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
 * DELETE /households/:id/members/:userId
 * Remove a member
 */
router.delete(
    '/:id/members/:userId',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await removeMemberUseCase.execute(req.params.id, req.userId!, req.params.userId);
            res.json({
                success: true,
                data: { removed: true },
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
 * POST /households/:id/transfer
 * Transfer head role
 */
router.post(
    '/:id/transfer',
    authenticate,
    validate([
        param('id').isUUID().withMessage('Invalid household ID'),
        body('newHeadUserId').isUUID().withMessage('Invalid user ID'),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await transferHeadUseCase.execute(req.params.id, req.userId!, req.body.newHeadUserId);
            res.json({
                success: true,
                data: { transferred: true, newHead: { userId: req.body.newHeadUserId } },
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
 * POST /households/:id/leave
 * Leave a household
 */
router.post(
    '/:id/leave',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await leaveHouseholdUseCase.execute(req.params.id, req.userId!);
            res.json({
                success: true,
                data: { left: true },
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

// Helper function
function formatHouseholdResponse(household: any) {
    return {
        id: household.id,
        name: household.name,
        headUserId: household.headUserId,
        status: household.status,
        createdAt: household.createdAt,
        members: household.members?.map((m: any) => ({
            userId: m.userId,
            fullName: m.user?.profile?.fullName,
            displayName: m.user?.profile?.displayName,
            avatarUrl: m.user?.profile?.avatarUrl,
            role: m.role,
            joinedAt: m.joinedAt,
        })),
        address: household.addresses?.[0] || null,
    };
}

export default router;
