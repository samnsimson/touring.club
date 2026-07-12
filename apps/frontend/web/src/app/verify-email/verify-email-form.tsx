'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Button, Link as ChakraLink, Stack, TextField } from '@tc/ui';
import { verifyEmailAction } from './actions';

const verifyEmailSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    otp: z
        .string()
        .length(6, 'Enter the 6-digit code')
        .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formError, setFormError] = useState<string | undefined>();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VerifyEmailFormValues>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: { email: searchParams.get('email') ?? '', otp: '' },
    });

    async function onSubmit(values: VerifyEmailFormValues) {
        setFormError(undefined);
        const result = await verifyEmailAction(values);

        if (result.error) {
            setFormError(result.error);
            return;
        }

        router.push('/login?verified=1');
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
                <TextField label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
                <TextField
                    label="Verification code"
                    inputMode="numeric"
                    required
                    autoComplete="one-time-code"
                    helperText="6-digit code from your email"
                    error={errors.otp?.message}
                    {...register('otp')}
                />
                <Button type="submit" colorPalette="orange" loading={isSubmitting} w="full">
                    Verify email
                </Button>
                <ChakraLink asChild fontSize="sm" alignSelf="center">
                    <NextLink href="/login">Back to sign in</NextLink>
                </ChakraLink>
            </form>
        </Stack>
    );
}
