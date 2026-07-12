'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Button, Link as ChakraLink, Stack, TextField } from '@tc/ui';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function useSuccessMessage(): string | undefined {
    const searchParams = useSearchParams();
    if (searchParams.get('verified')) return 'Email verified — you can now sign in.';
    if (searchParams.get('reset')) return 'Password reset — you can now sign in with your new password.';
    return undefined;
}

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const successMessage = useSuccessMessage();
    const [formError, setFormError] = useState<string | undefined>();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(values: LoginFormValues) {
        setFormError(undefined);
        const result = await signIn('credentials', { ...values, redirect: false });

        if (result?.error) {
            setFormError('Invalid email or password.');
            return;
        }

        router.push(searchParams.get('callbackUrl') ?? '/');
        router.refresh();
    }

    return (
        <Stack asChild gap="5">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {successMessage ? (
                    <Alert.Root status="success">
                        <Alert.Indicator />
                        <Alert.Title>{successMessage}</Alert.Title>
                    </Alert.Root>
                ) : null}
                {formError ? (
                    <Alert.Root status="error">
                        <Alert.Indicator />
                        <Alert.Title>{formError}</Alert.Title>
                    </Alert.Root>
                ) : null}
                <TextField label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
                <TextField
                    label="Password"
                    type="password"
                    required
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register('password')}
                />
                <ChakraLink asChild fontSize="sm" alignSelf="flex-end">
                    <NextLink href="/forgot-password">Forgot password?</NextLink>
                </ChakraLink>
                <Button type="submit" colorPalette="orange" loading={isSubmitting} w="full">
                    Sign in
                </Button>
                <ChakraLink asChild fontSize="sm" alignSelf="center">
                    <NextLink href="/register">Don&apos;t have an account? Sign up</NextLink>
                </ChakraLink>
            </form>
        </Stack>
    );
}
