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
        await fs.writeFile('tokens.json', JSON.stringify(tokens, null, 2));
    } catch (err) {
        console.error('Error saving tokens to file:', err);
    }

    const db = await mDB('gmailDiscord');
    const usersCollection = db.collection('users');
    const user = {
    email: email,
    tokens: tokens
    };

    await usersCollection.insertOne(user);
    await fs.
  
    res.redirect('/public/gauthsuccess.html');
  });

  module.exports = gRouter;