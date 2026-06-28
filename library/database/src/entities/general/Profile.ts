import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';

export type PrivacySettings = {
    showEmail: boolean;
    showTravelHistory: boolean;
};

export const defaultPrivacySettings = (): PrivacySettings => ({
    showEmail: false,
    showTravelHistory: true,
});

@Entity({ schema: 'general', name: 'profiles' })
export class Profile extends BaseEntity {
    @Column('text', { name: 'user_id', unique: true })
    userId!: string;

    @Column('text', { name: 'avatar_url', nullable: true })
    avatarUrl: string | null = null;

    @Column('text', { name: 'biography', nullable: true })
    biography: string | null = null;

    @Column('text', { name: 'interests', array: true, default: () => "'{}'" })
    interests!: string[];

    @Column('jsonb', { name: 'privacy_settings' })
    privacySettings!: PrivacySettings;
}
