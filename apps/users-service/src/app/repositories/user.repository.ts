import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, User, type DataSource } from '@tc/database';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(User, dataSource);
    }

    findById(id: string) {
        return this.findOne({ where: { id } });
    }
}
