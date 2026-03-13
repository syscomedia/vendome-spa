const { resolvers } = require('./src/graphql/resolvers');

async function test() {
    try {
        const result = await resolvers.Query.myReservations(null, {});
        console.log('RESERVATIONS:', JSON.stringify(result.slice(0, 2), null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
