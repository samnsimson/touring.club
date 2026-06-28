import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    protected constructor(target: EntityTarget<Entity>, dataSource: DataSource) {
        super(target, dataSource.manager);
    }
}
