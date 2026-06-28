import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export type PrivacySettings = {
    showEmail: boolean;
    showTravelHistory: boolean;
};

export const defaultPrivacySettings = (): PrivacySettings => ({
    showEmail: false,
    showTravelHistory: true,
});

@Entity({ schema: 'general', name: 'profiles' })
export class Profile {
    @PrimaryColumn('text', { name: 'user_id' })
    userId!: string;

    @Column('text', { name: 'biography', nullable: true })
    biography: string | null = null;

    @Column('text', { name: 'interests', array: true, default: () => "'{}'" })
    interests!: string[];

    @Column('jsonb', { name: 'privacy_settings' })
    privacySettings!: PrivacySettings;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
