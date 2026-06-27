import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class GetMeResponseDto extends AuthUserDto {}

export class SignOutResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;
}
