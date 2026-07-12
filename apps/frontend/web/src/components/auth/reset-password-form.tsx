'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Button, Link as ChakraLink, Stack, TextField } from '@tc/ui';
import { resetPasswordAction } from './reset-password-actions';

const resetPasswordSchema = z
    .object({
        newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
        confirmPassword: z.string().min(1, 'Confirm your password'),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [formError, setFormError] = useState<string | undefined>();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

    if (!token) {
        return (
            <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>This reset link is invalid or missing. Request a new one from the forgot password page.</Alert.Title>
            </Alert.Root>
        );
    }

    async function onSubmit(values: ResetPasswordFormValues) {
        if (!token) return;

        setFormError(undefined);
        const result = await resetPasswordAction({ newPassword: values.newPassword, token });

        if (result.error) {
            setFormError(result.error);
            return;
        }

        router.push('/login?reset=1');
    }

    return (
        <Stack asChild gap="5">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {formError ? (
                    <Alert.Root status="error">
                        <Alert.Indicator />
                        <Alert.Title>{formError}</Alert.Title>
                    </Alert.Root>
                ) : null}
                <TextField
                    label="New password"
                    type="password"
                    required
                    autoComplete="new-password"
                    helperText="At least 8 characters"
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                />
                <TextField
                    label="Confirm new password"
                    type="password"
                    required
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />
                <Button type="submit" colorPalette="orange" loading={isSubmitting} w="full">
                    Reset password
                </Button>
                <ChakraLink asChild fontSize="sm" alignSelf="center">
                    <NextLink href="/login">Back to sign in</NextLink>
                </ChakraLink>
            </form>
        </Stack>
    );
}
