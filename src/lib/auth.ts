import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                }),
            ]
            : []),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session }: any) {
            if (session.user) {
                const { query } = require("./db");
                const res = await query("SELECT id, role FROM users WHERE email = $1", [session.user.email]);
                if (res.rows.length > 0) {
                    session.user.role = res.rows[0].role;
                    session.user.id = res.rows[0].id;
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `vendome-spa.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
};
