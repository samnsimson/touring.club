import { ModuleMetadata } from '@nestjs/common';

import type { SendEmailInput } from './email/email.types';

export type EmailSender = {
    send(input: SendEmailInput): void;
};

export interface AuthConfig {
    isGlobal?: boolean;
}

export interface AuthModuleOptions {
    emailService?: EmailSender;
    imports?: ModuleMetadata['imports'];
    providers?: ModuleMetadata['providers'];
    exports?: ModuleMetadata['exports'];
}
