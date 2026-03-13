Critical Step: Configure Google Cloud (Free)
You need to generate your free Google API Keys to make the button work.

Go to the Google Cloud Console.
Create a new project (it's free).
Navigate to APIs & Services > Credentials.
Create OAuth Client ID credentials (choose "Web Application").
Set the Authorized redirect URI to: http://localhost:3000/api/auth/callback/google
Copy the Client ID and Client Secret.
Paste them into your 
.env
 file:
env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
Once these keys are added and the server is restarted, the "Continue with Google" button will be fully functional!