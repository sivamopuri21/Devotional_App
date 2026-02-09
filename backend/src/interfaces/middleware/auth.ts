import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../infrastructure/services/AuthService';
import { AppError } from '../../application/usecases';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: string;
}

/**
 * JWT Authentication Middleware
 */
export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('UNAUTHORIZED', 'Access token required', 401);
        }

        const token = authHeader.substring(7);

        try {
            const payload = AuthService.verifyAccessToken(token);
            req.userId = payload.sub;
            req.userRole = payload.role;
            next();
        } catch (error) {
            throw new AppError('INVALID_TOKEN', 'Invalid or expired access token', 401);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Role-based access control middleware
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.userRole) {
            return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
        }

        if (!allowedRoles.includes(req.userRole)) {
            return next(new AppError('FORBIDDEN', 'Insufficient permissions', 403));
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const payload = AuthService.verifyAccessToken(token);
            req.userId = payload.sub;
            req.userRole = payload.role;
        } catch (error) {
            // Ignore invalid token for optional auth
        }
    }

    next();
};
