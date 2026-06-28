export function requireDatabase(testName: string): boolean {
    if (process.env.DATABASE_URL) return true;
    console.warn(`Skipping ${testName}: DATABASE_URL is not set`);
    return false;
}
