import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const REDIRECT_URI = `${protocol}://${host}/api/auth/google-calendar`;

    if (!code) {
        // Step 1: Redirect to Google
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            REDIRECT_URI
        );

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar'
            ],
            prompt: 'consent'
        });

        return NextResponse.redirect(url);
    }

    // Step 2: Handle Callback
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            REDIRECT_URI
        );

        const { tokens } = await oauth2Client.getToken(code);
        
        await query(
            'UPDATE "User" SET google_calendar_token = $1, google_calendar_refresh_token = $2 WHERE email = $3',
            [tokens.access_token, tokens.refresh_token, session.user.email]
        );

        return NextResponse.redirect(new URL('/dashboard?sync=success', request.url));
    } catch (error) {
        console.error('Error in Google Calendar callback:', error);
        return NextResponse.redirect(new URL('/dashboard?sync=error', request.url));
    }
}
