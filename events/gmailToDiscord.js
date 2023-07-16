const express = require('express');
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const refresh = require('passport-oauth2-refresh');
const { google } = require('googleapis');
const { getDB } = require('../functions/connectToDatabase');

const gRouter = express.Router();

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.G_CLIENT_ID,
			clientSecret: process.env.G_CLIENT_SECRET,
			callbackURL: process.env.G_REDIRECT_URL,
		},
		async (accessToken, refreshToken, profile, done) => {
			const db = await getDB('gmailDiscord');
			const usersCollection = db.collection('users');

			const user = {
				email: profile.emails[0].value,
				tokens: { access_token: accessToken, refresh_token: refreshToken },
			};

			const existingDocument = await usersCollection.findOne({ email: user.email });

			if (!existingDocument) {
				await usersCollection.insertOne(user);
			} else {
				await usersCollection.updateOne({ email: user.email }, { $set: user });
			}

			done(null, user);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
	const db = await getDB('gmailDiscord');
	const usersCollection = db.collection('users');

	usersCollection.findOne({ email }, (err, user) => {
		done(err, user);
	});
});

async function refreshAccessToken(user) {
	return new Promise((resolve, reject) => {
		refresh.requestNewAccessToken('google', user.tokens.refresh_token, (err, accessToken, refreshToken) => {
			if (err) {
				reject(err);
			} else {
				user.tokens.access_token = accessToken;
				if (refreshToken) {
					user.tokens.refresh_token = refreshToken;
				}
				resolve(user);
			}
		});
	});
}

gRouter.get('/gmaildiscord', async (req, res) => {
	const oauth2Client = new google.auth.OAuth2(process.env.G_CLIENT_ID, process.env.G_CLIENT_SECRET, process.env.G_REDIRECT_URL);
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.modify'],
	});

	res.redirect(url);
});

gRouter.get('/gauth', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
	try {
		res.redirect('/public/gauthsuccess.html');
	} catch (err) {
		console.error('Error in /gauth route:', err);
		res.status(500).send('An error occurred');
	}

	getEmailsForAllUsers();
});

async function getEmailsForAllUsers() {
	const db = await getDB('gmailDiscord');
	const usersCollection = db.collection('users');
	const emailCollection = db.collection('emails');
	const users = await usersCollection.find({}).toArray();
	try {
		for (let user of users) {
			user = await refreshAccessToken(user);

			const oauth2Client = new google.auth.OAuth2(process.env.G_CLIENT_ID, process.env.G_CLIENT_SECRET, process.env.G_REDIRECT_URL);
			oauth2Client.setCredentials(user.tokens);

			const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
			const response = await gmail.users.messages.list({
				userId: 'me',
				q: 'in:inbox is:unread',
			});

			if (!response || !response.data || !response.data.messages) {
				console.log('No new emails.');
				return;
			}

			// Store new emails only
			for (let msg of response.data.messages) {
				const alreadyExisting = await emailCollection.findOne({ id: msg.id });
				if (alreadyExisting) {
					continue;
				}
				const message = await gmail.users.messages.get({
					userId: 'me',
					threadId: msg.threadId,
					id: msg.id,
					format: 'full',
				});
				const headers = message.data.payload.headers;
				const subjectHeader = headers.find((header) => header.name === 'Subject');
				const fromHeader = headers.find((header) => header.name === 'From');
				const url = `https://mail.google.com/mail/u/0/#inbox/${msg.threadId}`;

				// Check for multipart emails
				let part;
				if (message.data.payload.parts) {
					// Find 'text/plain' part
					part = message.data.payload.parts.find((part) => part.mimeType === 'text/plain');
				}

				let bodyData = part ? part.body.data : message.data.payload.body.data;
				let decodedBody = '';

				if (bodyData) {
					decodedBody = Buffer.from(bodyData, 'base64').toString();
					if (decodedBody.length > 3000) {
						decodedBody = `Email body is over 3000 characters. Please view and respond to this email from Gmail.)`;
					}
				}
				// Check if subject and from headers are found
				if (subjectHeader && fromHeader) {
					try {
						await emailCollection.insertOne({
							mailbox: email,
							id: msg.id,
							threadId: msg.threadId,
							subject: subjectHeader.value,
						});
					} catch (err) {
						console.error('Error inserting into the collection:', err);
					}

					// Send email details to a webhook URL
					const webhookURL = 'https://api.botghost.com/webhook/1090768041563918346/nc8b8c6a21jlx8lutoe90a';
					const header = {
						Authorization: process.env.BG_API_KEY,
						'Content-Type': 'application/json',
					};
					const reqBody = {
						variables: [
							{
								name: 'Email Sender',
								variable: '{email_sender}',
								value: `${fromHeader.value}`,
							},
							{
								name: 'Email Subject',
								variable: '{email_subject}',
								value: `${subjectHeader.value}`,
							},
							{
								name: 'Email Body',
								variable: '{email_body}',
								value: `${decodedBody}`,
							},
							{
								name: 'Email ID',
								variable: '{email_id}',
								value: `${msg.id}`,
							},
							{
								name: 'Email URL',
								variable: '{email_url}',
								value: `${url}`,
							},
						],
					};

					axios
						.post(webhookURL, reqBody, { headers: header })
						.then((res) => {
							console.log('Successful');
						})
						.catch((err) => {
							console.error('Error', err);
						});
				}
			}
		}
	} catch (err) {
		console.log('Error', err);
	}
}

module.exports = gRouter;
