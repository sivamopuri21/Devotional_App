import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
    profile: {
        fullName: string;
        displayName?: string;
        avatarUrl?: string;
    } | null;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    updateUser: (user: Partial<User>) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            setAuth: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),

            clearAuth: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'swadhrama-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
