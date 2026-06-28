import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, Conversation, type DataSource } from '@tc/database';

@Injectable()
export class ConversationRepository extends BaseRepository<Conversation> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Conversation, dataSource);
    }

    findDirectBetweenUsers(userId: string, otherUserId: string) {
        return this.findOne({
            where: {
                type: 'direct',
                participants: [{ userId }, { userId: otherUserId }],
            },
        });
    }

    findForUser(userId: string) {
        return this.find({
            where: { participants: { userId } },
            order: { updatedAt: 'DESC' },
        });
    }

    findByTripId(tripId: string) {
        return this.findOne({ where: { type: 'trip', trip: { id: tripId } } });
    }
}
