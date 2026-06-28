import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, Notification, type DataSource } from '@tc/database';

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Notification, dataSource);
    }

    findByUserId(userId: string) {
        return this.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }

    findByIdAndUserId(id: string, userId: string) {
        return this.findOne({ where: { id, userId } });
    }
}
