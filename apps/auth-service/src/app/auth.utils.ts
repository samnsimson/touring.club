import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export const applyAuthHeaders = (authHeaders: Headers, res: Response): void => {
    authHeaders.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
            res.append('Set-Cookie', value);
            return;
        }

        res.setHeader(key, value);
    });
};

type AuthApiError = {
    message: string;
    status?: string;
    statusCode?: number;
};

const isAuthApiError = (error: unknown): error is AuthApiError =>
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AuthApiError).message === 'string' &&
    'statusCode' in error &&
    typeof (error as AuthApiError).statusCode === 'number';

export const mapAuthError = (error: unknown): never => {
    if (isAuthApiError(error)) {
        throw new HttpException({ message: error.message, code: error.status }, error.statusCode ?? HttpStatus.BAD_REQUEST);
    }

    throw error;
};
