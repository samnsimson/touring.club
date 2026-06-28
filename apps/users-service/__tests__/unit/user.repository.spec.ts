import { User, type DataSource } from '@tc/database';
import { UserRepository } from '../../src/app/repositories/user.repository';

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let findOne: jest.SpiedFunction<UserRepository['findOne']>;

    beforeEach(() => {
        const dataSource = { manager: {} } as DataSource;
        userRepository = new UserRepository(dataSource);
        findOne = jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    });

    describe('findById', () => {
        it('queries by id', async () => {
            const user = { id: 'user-1' } as User;
            findOne.mockResolvedValue(user);
            const result = await userRepository.findById('user-1');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
            expect(result).toBe(user);
        });
    });
});
