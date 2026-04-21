import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { NextRequest } from 'next/server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async (req) => {
        const session = await getServerSession(authOptions);
        return { req, session };
    },
});

export async function GET(request: NextRequest) {
    return handler(request);
}

export async function POST(request: NextRequest) {
    try {
        // Clone the request to check the body without consuming it
        const clonedRequest = request.clone();
        const body = await clonedRequest.text();
        if (!body || body.trim() === '') {
            return new Response(JSON.stringify({ errors: [{ message: 'Empty body' }] }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return await handler(request);
    } catch (e) {
        console.error('GraphQL POST Error:', e);
        return new Response(JSON.stringify({ errors: [{ message: 'Internal Server Error' }] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
