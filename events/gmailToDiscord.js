const fs = require('fs').promises;
const express = require('express');
const gRouter = express.Router();
const { google } = require('googleapis');
const mDB = require('../functions/connectToDatabase')

const oauth2Client = new google.auth.OAuth2(
    process.env.G_CLIENT_ID,
    process.env.G_CLIENT_SECRET,
    process.env.G_REDIRECT_URL
  );

gRouter.get('/gmaildiscord', async (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.readonly'],
      });

      res.redirect(url);
  });

  gRouter.get('/gauth', async (req, res) => {
    try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
      });

    const userinfo = await oauth2.userinfo.get({});
    const email = userinfo.data.email;

    try {
        await fs.writeFile(`tokens_${email}.json`, JSON.stringify(tokens, null, 2));
    } catch (err) {
        console.error('Error saving tokens to file:', err);
    }

    const db = await mDB('gmailDiscord');
    const usersCollection = db.collection('users');
    const user = {
    email: email,
    tokens: tokens
    }

    const existingDocument = await usersCollection.findOne({ email });

    if (!existingDocument){
    await usersCollection.insertOne(user);
    };

    res.redirect('/public/gauthsuccess.html');
} catch(err) {
    console.error('Error in /gauth route:', err);
    res.status(500).send('An error occurred');
  }
  getEmailsForAllUsers();
});

async function getEmailsForAllUsers() {
    const db = await mDB('gmailDiscord');
    const usersCollection = db.collection('users');
    const emailCollection = db.collection('emails');
    const users = await usersCollection.find({}).toArray();
  
    for (let user of users) {
        const email = user.email;
        let tokens = user.tokens;

        // Attempt to load the tokens from local storage.
        try {
            const tokensData = await fs.readFile(`tokens_${email}.json`, 'utf8');
            tokens = JSON.parse(tokensData);
        } catch (err) {
            console.log('No local token found for user', email, '. Using tokens from database.');
        }

        oauth2Client.setCredentials(tokens);
  
        if (oauth2Client.isTokenExpiring()) {
            const refreshedTokens = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(refreshedTokens);
  
            // Update the tokens in the database and local storage
            await usersCollection.updateOne({ email: email }, { $set: { tokens: refreshedTokens } });
            await fs.writeFile(`tokens_${email}.json`, JSON.stringify(refreshedTokens, null, 2));
        }
  
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread'
        });

        // Store new emails only
        for (let msg of response.data.messages) {
            const message = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'metadata',
                metadataHeaders: ['Subject']
            });
            const headers = message.data.payload.headers;
            const subjectHeader = headers.find(header => header.name === 'Subject');
            const subjectContainsString = subjectHeader.value.includes('test email');

            if(subjectContainsString) {
                const storedEmail = await emailCollection.findOne({id: msg.id});
                // If email is not stored before
                if (!storedEmail) {
                    await emailCollection.insertOne({ id: msg.id, subject: subjectHeader.value });
                }
            }
        }
    }
}

  module.exports = gRouter;