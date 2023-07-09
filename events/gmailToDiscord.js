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

    const userinfo = await oauth2.userinfo.get();
    const email = userinfo.data.email;


    const db = await mDB('gmailDiscord');

    console.log(code, tokens, email);
  
    res.redirect('/gauthsuccess.html');
  });

  module.exports = gRouter;