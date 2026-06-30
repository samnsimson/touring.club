import { create } from 'zustand';
import { mockNotifications, type AppNotification } from '@tc/mocks';

export interface NotificationsState {
    notifications: AppNotification[];
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
    notifications: mockNotifications,
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        })),
    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
        })),
}));
