import { google } from 'googleapis';
import { query } from './db';

export const getAuthorizedGoogleClient = async (userEmail: string) => {
    const res = await query(
        "SELECT google_calendar_token, google_calendar_refresh_token FROM users WHERE email = $1",
        [userEmail]
    );

    if (res.rows.length === 0 || !res.rows[0].google_calendar_token) {
        return null;
    }

    const { google_calendar_token, google_calendar_refresh_token } = res.rows[0];

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXTAUTH_URL}/api/auth/google-calendar`
    );

    oauth2Client.setCredentials({
        access_token: google_calendar_token,
        refresh_token: google_calendar_refresh_token
    });

    // Handle token refresh automatically
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            await query(
                "UPDATE users SET google_calendar_token = $1, google_calendar_refresh_token = $2 WHERE email = $3",
                [tokens.access_token, tokens.refresh_token, userEmail]
            );
        } else {
            await query(
                "UPDATE users SET google_calendar_token = $1 WHERE email = $2",
                [tokens.access_token, userEmail]
            );
        }
    });

    return oauth2Client;
};

export const createGoogleCalendarEvent = async (auth: any, reservation: any) => {
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
        summary: `Vendôme SPA: ${reservation.service.name}`,
        description: `Client: ${reservation.user.name}\nService: ${reservation.service.name}\nSpécialiste: ${reservation.prestataire.name}\nStatus: ${reservation.status}`,
        start: {
            dateTime: new Date(reservation.date).toISOString(),
            timeZone: 'Africa/Tunis', 
        },
        end: {
            dateTime: new Date(new Date(reservation.date).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'Africa/Tunis',
        },
        colorId: reservation.prestataire?.calendar_color_id || null,
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return response.data.id;
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        return null;
    }
};

export const listGoogleCalendarEvents = async (auth: any, timeMin: string) => {
    const calendar = google.calendar({ version: 'v3', auth });

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return response.data.items || [];
    } catch (error) {
        console.error('Error listing Google Calendar events:', error);
        return [];
    }
};
