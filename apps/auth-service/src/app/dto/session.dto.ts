import { ApiProperty } from '@nestjs/swagger';
import { AuthUserResponse } from './auth-user.dto';

export class GetMeResponse extends AuthUserResponse {}

export class SignOutResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;
}
