'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Button, Link as ChakraLink, Stack, TextField } from '@tc/ui';
import { forgotPasswordAction } from './forgot-password-actions';

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [submitted, setSubmitted] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

    async function onSubmit(values: ForgotPasswordFormValues) {
        await forgotPasswordAction(values);
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <Alert.Root status="success">
                <Alert.Indicator />
                <Alert.Title>If an account exists for that email, we&apos;ve sent a password reset link.</Alert.Title>
            </Alert.Root>
        );
    }

    return (
        <Stack asChild gap="5">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <TextField label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
                <Button type="submit" colorPalette="orange" loading={isSubmitting} w="full">
                    Send reset link
                </Button>
                <ChakraLink asChild fontSize="sm" alignSelf="center">
                    <NextLink href="/login">Back to sign in</NextLink>
                </ChakraLink>
            </form>
        </Stack>
    );
}
