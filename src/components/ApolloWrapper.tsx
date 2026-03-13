'use client';

import { ApolloProvider } from '@apollo/client/react';
import { SessionProvider } from "next-auth/react";
import client from '@/lib/apollo-client';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ApolloProvider client={client}>{children}</ApolloProvider>
        </SessionProvider>
    );
}
