import pg from 'pg';

const userA = require('../fixtures/users/user-a.json') as { userId: string };
const userB = require('../fixtures/users/user-b.json') as { userId: string };
const publishedTrip = require('../fixtures/trips/published-trip.json') as { tripId: string };

async function resetFixtureConversations(databaseUrl: string): Promise<void> {
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query(
            `DELETE FROM general.messages WHERE conversation_id IN (
                SELECT conversation_id FROM general.conversation_participants WHERE user_id = ANY($1)
            )`,
            [[userA.userId, userB.userId]],
        );
        await client.query(`DELETE FROM general.conversation_participants WHERE user_id = ANY($1)`, [[userA.userId, userB.userId]]);
        await client.query(
            `DELETE FROM general.conversations WHERE id NOT IN (
                SELECT conversation_id FROM general.conversation_participants
            )`,
        );
    } finally {
        await client.end();
    }
}

async function resetFixtureTripChat(databaseUrl: string): Promise<void> {
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query(`DELETE FROM general.messages WHERE conversation_id IN (SELECT id FROM general.conversations WHERE trip_id = $1)`, [
            publishedTrip.tripId,
        ]);
        await client.query(`DELETE FROM general.conversation_participants WHERE conversation_id IN (SELECT id FROM general.conversations WHERE trip_id = $1)`, [
            publishedTrip.tripId,
        ]);
        await client.query(`DELETE FROM general.conversations WHERE trip_id = $1`, [publishedTrip.tripId]);
        await client.query(`DELETE FROM general.trip_memberships WHERE trip_id = $1`, [publishedTrip.tripId]);
        await client.query(`DELETE FROM general.trips WHERE id = $1`, [publishedTrip.tripId]);
    } finally {
        await client.end();
    }
}

declare global {
    var __TEARDOWN_MESSAGE__: string;
}

module.exports = async function () {
    console.log(globalThis.__TEARDOWN_MESSAGE__);

    if (process.env.DATABASE_URL) {
        await resetFixtureConversations(process.env.DATABASE_URL);
        await resetFixtureTripChat(process.env.DATABASE_URL);
    }
};
