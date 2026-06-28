import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({ example: 'jane@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: '123456', description: 'Six-digit email verification code' })
    @IsString()
    @Length(6, 6)
    @Matches(/^\d{6}$/, { message: 'otp must be a 6-digit code' })
    otp!: string;
}
