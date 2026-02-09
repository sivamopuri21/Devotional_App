import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from '../../application/usecases';

/**
 * Validation middleware wrapper
 */
export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map(err => ({
            field: (err as any).path,
            message: err.msg,
        }));

        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: extractedErrors,
            },
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
            },
        });
    };
};

/**
 * Global error handler
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid token',
            },
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
            },
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Token has expired',
            },
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Default server error
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message,
        },
        meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
        },
    });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
        meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
        },
    });
};
