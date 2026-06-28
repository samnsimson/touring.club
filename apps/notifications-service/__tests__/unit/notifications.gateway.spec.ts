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

    it('joins the user-scoped room on connect', () => {
        const client = { data: { userId: 'user-a' }, join: jest.fn(), disconnect: jest.fn() } as never;
        gateway.handleConnection(client);
        expect(client.join).toHaveBeenCalledWith('notifications:user:user-a');
        expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects clients with no authenticated userId', () => {
        const client = { data: {}, join: jest.fn(), disconnect: jest.fn() } as never;
        gateway.handleConnection(client);
        expect(client.disconnect).toHaveBeenCalledWith(true);
        expect(client.join).not.toHaveBeenCalled();
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
