import { E2ETestingEngine } from './e2e-testing-engine';
import type { E2ETestingEngineOptions } from './testing.contracts';

export const createE2ETestingEngine = (options: E2ETestingEngineOptions = {}): E2ETestingEngine => {
    return new E2ETestingEngine(options);
};

export { E2ETestingEngine, defaultEmailCaptureDir } from './e2e-testing-engine';
export { clearCapturedEmails, extractOtpFromEmail, extractResetTokenFromEmail, readCapturedEmails, waitForCapturedEmail } from './email-capture';
export { interpolateFixture, loadFixture } from './fixture-utils';
export { redactSnapshotValue } from './snapshot-utils';
export type { CapturedEmail, E2ETestingEngineOptions, FixtureContext, SnapshotValue, WaitForEmailOptions } from './testing.contracts';
