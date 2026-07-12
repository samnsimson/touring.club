'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Button, Link as ChakraLink, Stack, TextField } from '@tc/ui';
import { registerAction } from './actions';

const registerSchema = z
    .object({
        name: z.string().min(1, 'Name is required').max(128, 'Name is too long'),
        username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(16, 'Username must be at most 16 characters')
            .regex(/^[a-zA-Z0-9]+$/, 'Username must contain only letters and numbers'),
        email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
        confirmPassword: z.string().min(1, 'Confirm your password'),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const router = useRouter();
    const [formError, setFormError] = useState<string | undefined>();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

    async function onSubmit(values: RegisterFormValues) {
        setFormError(undefined);
        const result = await registerAction({ name: values.name, username: values.username, email: values.email, password: values.password });

        if (result.error) {
            setFormError(result.error);
            return;
        }

        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
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
                <TextField label="Full name" required autoComplete="name" error={errors.name?.message} {...register('name')} />
                <TextField
                    label="Username"
                    required
                    autoComplete="username"
                    helperText="Letters and numbers only"
                    error={errors.username?.message}
                    {...register('username')}
                />
                <TextField label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
                <TextField
                    label="Password"
                    type="password"
                    required
                    autoComplete="new-password"
                    helperText="At least 8 characters"
                    error={errors.password?.message}
                    {...register('password')}
                />
                <TextField
                    label="Confirm password"
                    type="password"
                    required
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />
                <Button type="submit" colorPalette="orange" loading={isSubmitting} w="full">
                    Create account
                </Button>
                <ChakraLink asChild fontSize="sm" alignSelf="center">
                    <NextLink href="/login">Already have an account? Sign in</NextLink>
                </ChakraLink>
            </form>
        </Stack>
    );
}
