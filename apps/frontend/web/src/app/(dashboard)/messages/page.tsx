import { AppEmptyState, Box, ConversationListItem, MessageBubble, PageHeader, Stack } from '@tc/ui';
import { currentUser, getMessagesForConversation, getUserById, mockConversations } from '@tc/mocks';

export const metadata = {
    title: 'Messages — touring.club',
};

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
    const { conversation: conversationId } = await searchParams;
    const activeConversation = mockConversations.find((conversation) => conversation.id === conversationId) ?? mockConversations[0];
    const messages = activeConversation ? getMessagesForConversation(activeConversation.id) : [];

    return (
        <>
            <PageHeader title="Messages" description="Direct conversations and trip group chats." />
            {mockConversations.length === 0 ? (
                <AppEmptyState title="No conversations yet" description="Join a trip or message another traveler to start a conversation." />
            ) : (
                <Stack direction={{ base: 'column', md: 'row' }} gap="6" borderWidth="1px" borderRadius="xl" overflow="hidden" minH="480px">
                    <Stack gap="1" w={{ base: 'full', md: '320px' }} flexShrink="0" borderRightWidth={{ md: '1px' }} p="3">
                        {mockConversations.map((conversation) => {
                            const conversationMessages = getMessagesForConversation(conversation.id);
                            const lastMessage = conversationMessages[conversationMessages.length - 1];
                            return (
                                <ConversationListItem
                                    key={conversation.id}
                                    href={`/messages?conversation=${conversation.id}`}
                                    title={conversation.title}
                                    avatarUrl={conversation.avatarUrl}
                                    lastMessagePreview={lastMessage?.body ?? 'No messages yet'}
                                    unreadCount={conversation.unreadCount}
                                    active={conversation.id === activeConversation?.id}
                                />
                            );
                        })}
                    </Stack>
                    <Box flex="1" p="5" overflowY="auto">
                        {activeConversation ? (
                            <Stack gap="4">
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        body={message.body}
                                        senderName={getUserById(message.senderId)?.name ?? 'Unknown'}
                                        createdAt={message.createdAt}
                                        isOwn={message.senderId === currentUser.id}
                                        isSystem={message.type === 'system'}
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <AppEmptyState title="Select a conversation" />
                        )}
                    </Box>
                </Stack>
            )}
        </>
    );
}
