import { NotificationsGateway } from '../../src/app/gateways';
import { NotificationResponse } from '../../src/app/dto';

jest.mock('@tc/auth', () => ({
    WsAuthGuard: class {},
}));

describe('NotificationsGateway', () => {
    let gateway: NotificationsGateway;

    beforeEach(() => {
        gateway = new NotificationsGateway();
    });

    it('joins the user-scoped room', () => {
        const client = { data: { userId: 'user-a' }, join: jest.fn() } as never;
        const result = gateway.handleJoin(client);
        expect(client.join).toHaveBeenCalledWith('notifications:user:user-a');
        expect(result).toEqual({ joined: true });
    });

    it('emits notification:created to the user-scoped room', () => {
        const emit = jest.fn();
        const to = jest.fn(() => ({ emit }));
        Object.defineProperty(gateway, 'server', { value: { to }, writable: true });
        const notification = { id: 'notification-1', title: 'Approved' } as NotificationResponse;
        gateway.emitNotificationCreated('user-a', notification);
        expect(to).toHaveBeenCalledWith('notifications:user:user-a');
        expect(emit).toHaveBeenCalledWith('notification:created', notification);
    });
});
