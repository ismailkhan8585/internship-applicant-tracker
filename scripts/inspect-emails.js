const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenv.split('\n').forEach((line) => {
  const [k, ...v] = line.trim().split('=');
  if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim();
});
const { createClient } = require('@supabase/supabase-js');
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectJobApps() {
  const { data: tokenRow } = await client
    .from('settings')
    .select('value')
    .eq('key', 'gmail_refresh_token')
    .maybeSingle();
  const token = env.GMAIL_REFRESH_TOKEN || tokenRow?.value;
  const { google } = require('googleapis');
  const oauth2 = new google.auth.OAuth2(
    env.GMAIL_CLIENT_ID,
    env.GMAIL_CLIENT_SECRET,
    env.GMAIL_REDIRECT_URI
  );
  oauth2.setCredentials({ refresh_token: token });
  const gmail = google.gmail({ version: 'v1', auth: oauth2 });

  // Search for the recent application emails
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: 'Frontend Developer Intern OR "New Job Application" OR "New Internship Application"',
    maxResults: 5,
  });

  console.log('Found notification emails count:', listRes.data.messages?.length);
  if (listRes.data.messages?.length) {
    for (const m of listRes.data.messages.slice(0, 3)) {
      const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
      const headers = msg.data.payload?.headers || [];
      console.log('====================================');
      console.log('ID:', m.id);
      console.log('From:', headers.find((h) => h.name === 'From')?.value);
      console.log('To:', headers.find((h) => h.name === 'To')?.value);
      console.log('Reply-To:', headers.find((h) => h.name === 'Reply-To')?.value);
      console.log('Subject:', headers.find((h) => h.name === 'Subject')?.value);
      console.log('Snippet:', msg.data.snippet);

      let bodyText = '';
      function extractText(parts) {
        for (const p of parts) {
          if (p.mimeType === 'text/plain' && p.body?.data) {
            bodyText += Buffer.from(p.body.data, 'base64').toString('utf8');
          } else if (p.mimeType === 'text/html' && p.body?.data && !bodyText) {
            bodyText += Buffer.from(p.body.data, 'base64').toString('utf8');
          }
          if (p.parts) extractText(p.parts);
        }
      }
      if (msg.data.payload?.parts) {
        extractText(msg.data.payload.parts);
      } else if (msg.data.payload?.body?.data) {
        bodyText = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf8');
      }
      console.log('Body snippet (first 600 chars):\n', bodyText.substring(0, 600));
    }
  }
}
inspectJobApps().catch(console.error);
