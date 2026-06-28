import { UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '@tc/auth';

export class TripUtils {
    static getUserId(request: AuthenticatedRequest): string {
        const session = request.session;
        const userId = session && typeof session === 'object' && 'userId' in session && typeof session.userId === 'string' ? session.userId : session?.sub;
        if (!userId || typeof userId !== 'string') throw new UnauthorizedException('Not authenticated');
        return userId;
    }
}
