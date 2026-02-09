// Domain Entity: Household
export interface Household {
    id: string;
    name: string;
    headUserId: string;
    status: HouseholdStatus;
    createdAt: Date;
    updatedAt: Date;
    members?: HouseholdMember[];
    addresses?: Address[];
}

export interface HouseholdMember {
    id: string;
    householdId: string;
    userId: string;
    role: HouseholdRole;
    status: MemberStatus;
    invitedById: string | null;
    joinedAt: Date;
    leftAt: Date | null;
    user?: {
        id: string;
        profile?: {
            fullName: string;
            displayName: string | null;
            avatarUrl: string | null;
        };
    };
}

export interface HouseholdInvite {
    id: string;
    householdId: string;
    inviterId: string;
    inviteeContact: string;
    inviteeUserId: string | null;
    role: HouseholdRole;
    token: string;
    status: InviteStatus;
    expiresAt: Date;
    createdAt: Date;
    respondedAt: Date | null;
}

export interface Address {
    id: string;
    userId: string | null;
    householdId: string | null;
    type: AddressType;
    label: string | null;
    line1: string;
    line2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    isPrimary: boolean;
}

// Enums
export enum HouseholdStatus {
    ACTIVE = 'ACTIVE',
    REMOVED = 'REMOVED',
    LEFT = 'LEFT',
}

export enum HouseholdRole {
    HEAD = 'HEAD',
    ADULT = 'ADULT',
    CHILD = 'CHILD',
}

export enum MemberStatus {
    ACTIVE = 'ACTIVE',
    REMOVED = 'REMOVED',
    LEFT = 'LEFT',
}

export enum InviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    EXPIRED = 'EXPIRED',
}

export enum AddressType {
    HOME = 'HOME',
    OFFICE = 'OFFICE',
    TEMPLE = 'TEMPLE',
    OTHER = 'OTHER',
}

// Value Objects
export interface CreateHouseholdData {
    name: string;
    address?: CreateAddressData;
}

export interface CreateAddressData {
    type?: AddressType;
    label?: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    isPrimary?: boolean;
}

export interface InviteMemberData {
    contact: string;
    role: HouseholdRole;
    message?: string;
}
