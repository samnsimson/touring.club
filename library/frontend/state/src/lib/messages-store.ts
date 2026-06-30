import { create } from 'zustand';
import { currentUser, mockConversations, mockMessages, type Conversation, type Message } from '@tc/mocks';

function groupMessagesByConversation(messages: Message[]): Record<string, Message[]> {
    return messages.reduce<Record<string, Message[]>>((acc, message) => {
        acc[message.conversationId] = [...(acc[message.conversationId] ?? []), message];
        return acc;
    }, {});
}

export interface MessagesState {
    conversations: Conversation[];
    messagesByConversation: Record<string, Message[]>;
    sendMessage: (conversationId: string, body: string) => void;
    markConversationRead: (conversationId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
    conversations: mockConversations,
    messagesByConversation: groupMessagesByConversation(mockMessages),
    sendMessage: (conversationId, body) =>
        set((state) => {
            const message: Message = {
                id: `msg-${Date.now()}`,
                conversationId,
                senderId: currentUser.id,
                type: 'text',
                body,
                createdAt: new Date().toISOString(),
            };
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message],
                },
            };
        }),
    markConversationRead: (conversationId) =>
        set((state) => ({
            conversations: state.conversations.map((conversation) => (conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation)),
        })),
}));
