import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    authorization: {
                        params: {
                            scope: "email profile",
                            access_type: "offline"
                        }
                    }
                }),
                GoogleProvider({
                    id: "google_calendar",
                    name: "Google Calendar",
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    authorization: {
                        params: {
                            scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar",
                            access_type: "offline",
                            prompt: "consent"
                        }
                    }
                }),
            ]
            : []),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                const res = await query("SELECT id, role FROM users WHERE email = $1", [session.user.email]);
                if (res.rows.length > 0) {
                    session.user.role = res.rows[0].role;
                    session.user.id = res.rows[0].id;
                }
                session.accessToken = token.accessToken;
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
