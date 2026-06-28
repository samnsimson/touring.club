import { validate } from 'class-validator';
import {
    AuthErrorResponseDto,
    AuthSessionResponseDto,
    AuthUserDto,
    ChangePasswordDto,
    ChangePasswordResponseDto,
    ForgotPasswordDto,
    ForgotPasswordResponseDto,
    GetMeResponseDto,
    ResetPasswordDto,
    ResetPasswordResponseDto,
    SignInDto,
    SignInResponseDto,
    SignOutResponseDto,
    SignUpDto,
    SignUpResponseDto,
    UpdateProfileDto,
    UpdateProfileResponseDto,
    VerifyEmailDto,
    VerifyEmailResponseDto,
} from '../../src/app/dto';

const authUser = (): AuthUserDto =>
    Object.assign(new AuthUserDto(), {
        id: 'usr_1',
        email: 'jane@example.com',
        name: 'Jane Doe',
        emailVerified: true,
        username: 'janedoe',
        displayUsername: 'Jane Doe',
        role: 'user',
        image: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

describe('DTOs', () => {
    it('covers auth user and session response shapes', () => {
        const user = authUser();
        const minimalUser = Object.assign(new AuthUserDto(), { id: 'usr_2', email: 'minimal@example.com', name: 'Minimal User' });
        const sessionResponse = Object.assign(new AuthSessionResponseDto(), user, {
            sessionToken: 'session-token',
            accessToken: 'access-token',
        });
        const signUpResponse = Object.assign(new SignUpResponseDto(), user, {
            sessionToken: 'session-token',
            accessToken: 'access-token',
        });
        const signUpPending = Object.assign(new SignUpResponseDto(), user);
        const signInResponse = Object.assign(new SignInResponseDto(), user, {
            sessionToken: 'session-token',
            accessToken: 'access-token',
        });
        const verifyResponse = Object.assign(new VerifyEmailResponseDto(), user, {
            sessionToken: 'session-token',
            accessToken: 'access-token',
        });
        const getMeResponse = Object.assign(new GetMeResponseDto(), user);
        const updateProfileResponse = Object.assign(new UpdateProfileResponseDto(), { user });
        const signOutResponse = Object.assign(new SignOutResponseDto(), { success: true });
        const changePasswordResponse = Object.assign(new ChangePasswordResponseDto(), { success: true });
        const forgotPasswordResponse = Object.assign(new ForgotPasswordResponseDto(), { success: true });
        const resetPasswordResponse = Object.assign(new ResetPasswordResponseDto(), { success: true });
        const authError = Object.assign(new AuthErrorResponseDto(), { message: 'Invalid email or password', code: 'INVALID_EMAIL_OR_PASSWORD' });

        expect(sessionResponse.accessToken).toBe('access-token');
        expect(signUpResponse.sessionToken).toBe('session-token');
        expect(signUpPending.sessionToken).toBeUndefined();
        expect(signInResponse.sessionToken).toBe('session-token');
        expect(verifyResponse.accessToken).toBe('access-token');
        expect(getMeResponse.email).toBe(user.email);
        expect(updateProfileResponse.user.name).toBe('Jane Doe');
        expect(signOutResponse.success).toBe(true);
        expect(changePasswordResponse.success).toBe(true);
        expect(forgotPasswordResponse.success).toBe(true);
        expect(resetPasswordResponse.success).toBe(true);
        expect(authError.code).toBe('INVALID_EMAIL_OR_PASSWORD');
        expect(minimalUser.username).toBeUndefined();
    });

    it('validates request DTO optional branches', async () => {
        const changePassword = Object.assign(new ChangePasswordDto(), {
            currentPassword: 'OldPass123!',
            newPassword: 'NewPass123!',
            revokeOtherSessions: false,
        });
        const changePasswordDefault = Object.assign(new ChangePasswordDto(), {
            currentPassword: 'OldPass123!',
            newPassword: 'NewPass123!',
            revokeOtherSessions: undefined,
        });
        const updateProfile = Object.assign(new UpdateProfileDto(), { name: 'Jane Doe', image: null });
        const updateProfileNameOnly = Object.assign(new UpdateProfileDto(), { name: 'Jane Doe' });
        const signUp = Object.assign(new SignUpDto(), {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'Str0ngPass!',
            username: 'janedoe',
            displayUsername: 'Jane Doe',
            image: 'https://example.com/avatar.png',
            callbackURL: 'https://example.com/welcome',
            rememberMe: true,
        });
        const signIn = Object.assign(new SignInDto(), { email: 'jane@example.com', password: 'Str0ngPass!' });
        const verifyEmail = Object.assign(new VerifyEmailDto(), { email: 'jane@example.com', otp: '123456' });
        const forgotPassword = Object.assign(new ForgotPasswordDto(), {
            email: 'jane@example.com',
            redirectTo: 'https://touring.club/reset-password',
        });
        const forgotPasswordEmailOnly = Object.assign(new ForgotPasswordDto(), { email: 'jane@example.com' });
        const resetPassword = Object.assign(new ResetPasswordDto(), { token: 'reset-token', newPassword: 'Str0ngPass!' });

        expect(await validate(changePassword)).toEqual([]);
        expect(await validate(changePasswordDefault)).toEqual([]);
        expect(await validate(updateProfile)).toEqual([]);
        expect(await validate(updateProfileNameOnly)).toEqual([]);
        expect(await validate(signUp)).toEqual([]);
        expect(await validate(signIn)).toEqual([]);
        expect(await validate(verifyEmail)).toEqual([]);
        expect(await validate(forgotPassword)).toEqual([]);
        expect(await validate(forgotPasswordEmailOnly)).toEqual([]);
        expect(await validate(resetPassword)).toEqual([]);
    });
});
