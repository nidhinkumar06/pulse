import { google } from "googleapis";
import * as readline from "readline";
import "dotenv/config";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID // from downloaded JSON
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET // from downloaded JSON
const REDIRECT_URI = "http://localhost:3000/oauth/callback";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/tasks",
  ],
});

console.log("\n1. Open this URL in your browser:\n");
console.log(url);
console.log("\n2. After approving, you'll be redirected to localhost");
console.log("   Copy the 'code' param from the URL and paste below:\n");
console.log(
  "   Example: http://localhost:3000/oauth/callback?code=4/0AX...  ← copy just the code\n",
);

const rl = readline.createInterface({ input: process.stdin });
rl.question("Paste code here: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log("\n Refresh token:", tokens.refresh_token);
    console.log("\nNow run:");
    console.log(
      `echo -n "${tokens.refresh_token}" | gcloud secrets create google-refresh-token --data-file=-`,
    );
  } catch (err) {
    console.error("Error:", err);
  }
  rl.close();
});
