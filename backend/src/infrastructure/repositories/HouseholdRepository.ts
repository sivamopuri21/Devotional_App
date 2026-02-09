import prisma from '../database/prisma';
import {
    Household,
    HouseholdMember,
    HouseholdInvite,
    HouseholdRole,
    MemberStatus,
    InviteStatus,
    CreateHouseholdData,
    CreateAddressData,
    AddressType
} from '../../domain/entities';
import { AuthService } from '../services/AuthService';

export class HouseholdRepository {
    /**
     * Create a new household
     */
    async create(userId: string, data: CreateHouseholdData): Promise<Household> {
        const household = await prisma.household.create({
            data: {
                name: data.name,
                headUserId: userId,
                members: {
                    create: {
                        userId,
                        role: HouseholdRole.HEAD,
                        status: MemberStatus.ACTIVE,
                    },
                },
                addresses: data.address ? {
                    create: {
                        userId,
                        type: data.address.type || AddressType.HOME,
                        label: data.address.label,
                        line1: data.address.line1,
                        line2: data.address.line2,
                        landmark: data.address.landmark,
                        city: data.address.city,
                        state: data.address.state,
                        pincode: data.address.pincode,
                        latitude: data.address.latitude,
                        longitude: data.address.longitude,
                        isPrimary: true,
                    },
                } : undefined,
            },
            include: {
                members: { include: { user: { include: { profile: true } } } },
                addresses: true,
            },
        });

        return this.mapToEntity(household);
    }

    /**
     * Find household by ID
     */
    async findById(id: string): Promise<Household | null> {
        const household = await prisma.household.findUnique({
            where: { id },
            include: {
                members: {
                    where: { status: MemberStatus.ACTIVE },
                    include: { user: { include: { profile: true } } },
                },
                addresses: true,
            },
        });
        return household ? this.mapToEntity(household) : null;
    }

    /**
     * Find user's household (as member)
     */
    async findByUserId(userId: string): Promise<Household | null> {
        const member = await prisma.householdMember.findFirst({
            where: { userId, status: MemberStatus.ACTIVE },
            include: {
                household: {
                    include: {
                        members: {
                            where: { status: MemberStatus.ACTIVE },
                            include: { user: { include: { profile: true } } },
                        },
                        addresses: true,
                    },
                },
            },
        });
        return member?.household ? this.mapToEntity(member.household) : null;
    }

    /**
     * Check if user is head of any household
     */
    async isUserHead(userId: string): Promise<boolean> {
        const count = await prisma.household.count({
            where: { headUserId: userId, status: MemberStatus.ACTIVE },
        });
        return count > 0;
    }

    /**
     * Update household name
     */
    async updateName(id: string, name: string): Promise<Household> {
        const household = await prisma.household.update({
            where: { id },
            data: { name },
            include: {
                members: {
                    where: { status: MemberStatus.ACTIVE },
                    include: { user: { include: { profile: true } } },
                },
                addresses: true,
            },
        });
        return this.mapToEntity(household);
    }

    /**
     * Add member to household
     */
    async addMember(householdId: string, userId: string, role: HouseholdRole, invitedById?: string): Promise<HouseholdMember> {
        const member = await prisma.householdMember.create({
            data: {
                householdId,
                userId,
                role,
                invitedById,
                status: MemberStatus.ACTIVE,
            },
            include: { user: { include: { profile: true } } },
        });
        return this.mapMemberToEntity(member);
    }

    /**
     * Update member role
     */
    async updateMemberRole(householdId: string, userId: string, role: HouseholdRole): Promise<void> {
        await prisma.householdMember.updateMany({
            where: { householdId, userId, status: MemberStatus.ACTIVE },
            data: { role },
        });
    }

    /**
     * Remove member from household
     */
    async removeMember(householdId: string, userId: string): Promise<void> {
        await prisma.householdMember.updateMany({
            where: { householdId, userId },
            data: { status: MemberStatus.REMOVED, leftAt: new Date() },
        });
    }

    /**
     * Transfer head role
     */
    async transferHead(householdId: string, newHeadId: string): Promise<void> {
        await prisma.$transaction([
            // Update household head
            prisma.household.update({
                where: { id: householdId },
                data: { headUserId: newHeadId },
            }),
            // Update old head to adult
            prisma.householdMember.updateMany({
                where: { householdId, role: HouseholdRole.HEAD },
                data: { role: HouseholdRole.ADULT },
            }),
            // Update new head role
            prisma.householdMember.updateMany({
                where: { householdId, userId: newHeadId },
                data: { role: HouseholdRole.HEAD },
            }),
        ]);
    }

    /**
     * Create household invite
     */
    async createInvite(householdId: string, inviterId: string, contact: string, role: HouseholdRole): Promise<HouseholdInvite> {
        const token = AuthService.generateInviteToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const invite = await prisma.householdInvite.create({
            data: {
                householdId,
                inviterId,
                inviteeContact: contact,
                role,
                token,
                expiresAt,
            },
        });

        return this.mapInviteToEntity(invite);
    }

    /**
     * Find invite by token
     */
    async findInviteByToken(token: string): Promise<HouseholdInvite | null> {
        const invite = await prisma.householdInvite.findUnique({
            where: { token },
        });
        return invite ? this.mapInviteToEntity(invite) : null;
    }

    /**
     * Accept invite
     */
    async acceptInvite(token: string, userId: string): Promise<void> {
        await prisma.householdInvite.update({
            where: { token },
            data: {
                status: InviteStatus.ACCEPTED,
                inviteeUserId: userId,
                respondedAt: new Date(),
            },
        });
    }

    /**
     * Decline invite
     */
    async declineInvite(token: string): Promise<void> {
        await prisma.householdInvite.update({
            where: { token },
            data: {
                status: InviteStatus.DECLINED,
                respondedAt: new Date(),
            },
        });
    }

    /**
     * Get pending invites for household
     */
    async getPendingInvites(householdId: string): Promise<HouseholdInvite[]> {
        const invites = await prisma.householdInvite.findMany({
            where: {
                householdId,
                status: InviteStatus.PENDING,
                expiresAt: { gt: new Date() },
            },
        });
        return invites.map(i => this.mapInviteToEntity(i));
    }

    private mapToEntity(data: any): Household {
        return {
            id: data.id,
            name: data.name,
            headUserId: data.headUserId,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            members: data.members?.map((m: any) => this.mapMemberToEntity(m)),
            addresses: data.addresses,
        };
    }

    private mapMemberToEntity(data: any): HouseholdMember {
        return {
            id: data.id,
            householdId: data.householdId,
            userId: data.userId,
            role: data.role,
            status: data.status,
            invitedById: data.invitedById,
            joinedAt: data.joinedAt,
            leftAt: data.leftAt,
            user: data.user ? {
                id: data.user.id,
                profile: data.user.profile ? {
                    fullName: data.user.profile.fullName,
                    displayName: data.user.profile.displayName,
                    avatarUrl: data.user.profile.avatarUrl,
                } : undefined,
            } : undefined,
        };
    }

    private mapInviteToEntity(data: any): HouseholdInvite {
        return {
            id: data.id,
            householdId: data.householdId,
            inviterId: data.inviterId,
            inviteeContact: data.inviteeContact,
            inviteeUserId: data.inviteeUserId,
            role: data.role,
            token: data.token,
            status: data.status,
            expiresAt: data.expiresAt,
            createdAt: data.createdAt,
            respondedAt: data.respondedAt,
        };
    }
}
