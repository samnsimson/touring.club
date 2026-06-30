import { Avatar } from '@chakra-ui/react';

export interface UserAvatarProps {
    name: string;
    src?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function UserAvatar({ name, src, size = 'md' }: UserAvatarProps) {
    return (
        <Avatar.Root size={size} colorPalette="orange">
            <Avatar.Fallback name={name} />
            {src ? <Avatar.Image src={src} alt={name} /> : null}
        </Avatar.Root>
    );
}
