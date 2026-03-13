# How to Set Up Google Sign-In for Free

This project uses **NextAuth.js**, which is a **free, open-source** library. We are **NOT** using any paid services like Auth0 or Clerk.

However, to allow users to "Log in with Google", you must register your application with Google. This is free for standard login purposes.

## Is it really free?
**YES.** Google provides "Google Identity" (OAuth 2.0) for free to developers. 
- You do **not** need to pay.
- You do **not** need a paid subscription.
- You generally do **not** need to enable billing for simple OAuth consent screens in "Testing" mode.

## Steps to enable it without paying:

1.  **Go to Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  **Create a Project**:
    - Click "Select a project" > "New Project".
    - Name it "Vendome SPA".
    - **No Organization** needed.
3.  **Configure OAuth Consent Screen**:
    - Go to "APIs & Services" > "OAuth consent screen".
    - Select **External** (or Internal if you have a Google Workspace). for personal testing, **External** is fine.
    - FIll in required fields:
        - App Name: "Vendome"
        - Support Email: your email
        - Developer Contact Email: your email
    - Click "Save and Continue".
    - You don't need to add special "Scopes" (the defaults `email`, `profile`, `openid` are free and sufficient).
    - **Test Users**: Add your own Gmail address here so you can test it immediately.
4.  **Get Credentials**:
    - Go to "Credentials" on the left menu.
    - Click "+ CREATE CREDENTIALS" > "OAuth client ID".
    - Application Type: **Web application**.
    - Name: "Vendome Web".
    - **Authorized JavaScript origins**: `http://localhost:3000`
    - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
    - Click **CREATE**.
5.  **Copy Keys**:
    - You will see "Client ID" and "Client Secret".
    - Copy these into your `.env` file in the project folder.

```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## Troubleshooting "Payment Method"
If Google asks for a credit card during *project creation*, it is usually for identity verification to prevent bots. They have a "Free Tier" that is very generous.
- if you strictly cannot add a card even for verification, you cannot use "Sign in with Google" on *any* platform (Wordpress, Wix, Custom Code), because Google requires it.
- **However**, for the "OAuth Consent Screen" in **Testing** mode, you typically do **not** need verified billing.

## Summary
The code I wrote is free. The library is free. You just need to get the "password" (API Key) from Google to allow your app to talk to them.
