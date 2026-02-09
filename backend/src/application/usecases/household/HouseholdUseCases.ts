import { HouseholdRepository } from '../../../infrastructure/repositories/HouseholdRepository';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import {
    Household,
    HouseholdInvite,
    HouseholdRole,
    InviteStatus,
    CreateHouseholdData
} from '../../../domain/entities';
import { AppError } from '../auth/AuthUseCases';

export class CreateHouseholdUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(userId: string, data: CreateHouseholdData): Promise<Household> {
        // Check if user is already head of a household
        const isHead = await this.householdRepository.isUserHead(userId);
        if (isHead) {
            throw new AppError('ALREADY_HEAD', 'You are already head of a household', 400);
        }

        return this.householdRepository.create(userId, data);
    }
}

export class GetHouseholdUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(householdId: string, userId: string): Promise<Household> {
        const household = await this.householdRepository.findById(householdId);

        if (!household) {
            throw new AppError('HOUSEHOLD_NOT_FOUND', 'Household not found', 404);
        }

        // Check if user is a member
        const isMember = household.members?.some(m => m.userId === userId);
        if (!isMember) {
            throw new AppError('ACCESS_DENIED', 'You are not a member of this household', 403);
        }

        return household;
    }
}

export class InviteMemberUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(
        householdId: string,
        inviterId: string,
        contact: string,
        role: HouseholdRole
    ): Promise<HouseholdInvite & { inviteLink: string }> {
        const household = await this.householdRepository.findById(householdId);

        if (!household) {
            throw new AppError('HOUSEHOLD_NOT_FOUND', 'Household not found', 404);
        }

        // Only head can invite
        if (household.headUserId !== inviterId) {
            throw new AppError('ACCESS_DENIED', 'Only household head can invite members', 403);
        }

        // Check if already a member
        const existingMember = household.members?.find(
            m => m.user?.profile?.fullName?.toLowerCase().includes(contact.toLowerCase())
        );
        if (existingMember) {
            throw new AppError('ALREADY_MEMBER', 'User is already a member', 400);
        }

        const invite = await this.householdRepository.createInvite(householdId, inviterId, contact, role);

        const inviteLink = `${process.env.APP_URL || 'https://app.swadharmaparirakshna.com'}/invite/${invite.token}`;

        return { ...invite, inviteLink };
    }
}

export class AcceptInviteUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(token: string, userId: string): Promise<Household> {
        const invite = await this.householdRepository.findInviteByToken(token);

        if (!invite) {
            throw new AppError('INVITE_NOT_FOUND', 'Invitation not found', 404);
        }

        if (invite.status !== InviteStatus.PENDING) {
            throw new AppError('INVITE_ALREADY_USED', 'Invitation has already been used', 400);
        }

        if (invite.expiresAt < new Date()) {
            throw new AppError('INVITE_EXPIRED', 'Invitation has expired', 400);
        }

        // Add user to household
        await this.householdRepository.addMember(
            invite.householdId,
            userId,
            invite.role,
            invite.inviterId
        );

        // Mark invite as accepted
        await this.householdRepository.acceptInvite(token, userId);

        // Return updated household
        const household = await this.householdRepository.findById(invite.householdId);
        return household!;
    }
}

export class DeclineInviteUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(token: string): Promise<void> {
        const invite = await this.householdRepository.findInviteByToken(token);

        if (!invite) {
            throw new AppError('INVITE_NOT_FOUND', 'Invitation not found', 404);
        }

        await this.householdRepository.declineInvite(token);
    }
}

export class UpdateMemberRoleUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(householdId: string, requesterId: string, targetUserId: string, newRole: HouseholdRole): Promise<void> {
        const household = await this.householdRepository.findById(householdId);

        if (!household) {
            throw new AppError('HOUSEHOLD_NOT_FOUND', 'Household not found', 404);
        }

        // Only head can update roles
        if (household.headUserId !== requesterId) {
            throw new AppError('ACCESS_DENIED', 'Only household head can update roles', 403);
        }

        // Cannot change head role this way
        if (newRole === HouseholdRole.HEAD) {
            throw new AppError('USE_TRANSFER', 'Use transfer endpoint to change head', 400);
        }

        await this.householdRepository.updateMemberRole(householdId, targetUserId, newRole);
    }
}

export class RemoveMemberUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(householdId: string, requesterId: string, targetUserId: string): Promise<void> {
        const household = await this.householdRepository.findById(householdId);

        if (!household) {
            throw new AppError('HOUSEHOLD_NOT_FOUND', 'Household not found', 404);
        }

        // Only head can remove members
        if (household.headUserId !== requesterId) {
            throw new AppError('ACCESS_DENIED', 'Only household head can remove members', 403);
        }

        // Cannot remove self
        if (targetUserId === requesterId) {
            throw new AppError('CANNOT_REMOVE_SELF', 'Head cannot remove themselves', 400);
        }

        await this.householdRepository.removeMember(householdId, targetUserId);
    }
}

export class TransferHeadUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(householdId: string, currentHeadId: string, newHeadId: string): Promise<void> {
        const household = await this.householdRepository.findById(householdId);

        if (!household) {
            throw new AppError('HOUSEHOLD_NOT_FOUND', 'Household not found', 404);
        }

        if (household.headUserId !== currentHeadId) {
            throw new AppError('ACCESS_DENIED', 'Only current head can transfer role', 403);
        }

        // Verify new head is an adult member
        const newHead = household.members?.find(m => m.userId === newHeadId);
        if (!newHead) {
            throw new AppError('NOT_A_MEMBER', 'Target user is not a member', 400);
        }
        if (newHead.role === HouseholdRole.CHILD) {
            throw new AppError('CANNOT_BE_HEAD', 'Child members cannot become head', 400);
        }

        await this.householdRepository.transferHead(householdId, newHeadId);
    }
}

export class LeaveHouseholdUseCase {
    constructor(
        private householdRepository: HouseholdRepository
    ) { }

    async execute(householdId: string, userId: string): Promise<void> {
        const household = await this.householdRepository.findById(householdId);

        if (!household) {
            throw new AppError('HOUSEHOLD_NOT_FOUND', 'Household not found', 404);
        }

        // Head must transfer before leaving
        if (household.headUserId === userId) {
            throw new AppError('HEAD_CANNOT_LEAVE', 'Transfer head role before leaving', 400);
        }

        await this.householdRepository.removeMember(householdId, userId);
    }
}
