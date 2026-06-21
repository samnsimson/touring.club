import { SnakeNamingStrategy } from './utils.js';

describe('SnakeNamingStrategy', () => {
    const strategy = new SnakeNamingStrategy();

    it('converts class names to snake_case table names', () => {
        expect(strategy.tableName('UserAccount', undefined)).toBe('user_account');
    });

    it('respects custom table names', () => {
        expect(strategy.tableName('UserAccount', 'users')).toBe('users');
    });

    it('converts property names to snake_case column names', () => {
        expect(strategy.columnName('emailVerified', undefined, [])).toBe('email_verified');
    });

    it('respects custom column names', () => {
        expect(strategy.columnName('emailVerified', 'email_verified', [])).toBe('email_verified');
    });

    it('prefixes embedded column names', () => {
        expect(strategy.columnName('street', undefined, ['address'])).toBe('address_street');
    });

    it('builds join column names in snake_case', () => {
        expect(strategy.joinColumnName('user', 'id')).toBe('user_id');
    });
});
