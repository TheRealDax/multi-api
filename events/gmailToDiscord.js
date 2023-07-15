const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const { getDB } = require('../functions/connectToDatabase');

const gRouter = express.Router();
const oauth2Client = new google.auth.OAuth2(process.env.G_CLIENT_ID, process.env.G_CLIENT_SECRET, process.env.G_REDIRECT_URL);

gRouter.get('/gmaildiscord', async (req, res) => {
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.modify'],
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
			version: 'v2',
		});
		

		console.log('TOKENS:', tokens); //! for logging

		const userinfo = await oauth2.userinfo.get({});
		const email = userinfo.data.email;

		const db = await getDB('gmailDiscord');
		const usersCollection = db.collection('users');
		const user = {
			email: email,
			tokens,
		};


		//console.log('USER', user); //! for logging

		const existingDocument = await usersCollection.findOne({ email: email });

		if (!existingDocument) {
			await usersCollection.insertOne(user);
		}

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
			const email = user.email;
			let tokens = user.tokens;

			//console.log('TOKENS', tokens); //! for logging

			oauth2Client.setCredentials(tokens);

			if (oauth2Client.isTokenExpiring()) {
				const refreshedTokens = await oauth2Client.refreshAccessToken();
				//console.log('REFRESHEDTOKENS', refreshedTokens) //! for logging
				oauth2Client.setCredentials({
					access_token: refreshedTokens.credentials.access_token,
					expiry_date: refreshedTokens.credentials.expiry_date,
					refresh_token: tokens.refresh_token
				  });

				await usersCollection.updateOne({ email: email }, { $set: { 'tokens.access_token': refreshedTokens.credentials.access_token, 'tokens.expiry_date': refreshedTokens.credentials.expiry_date } }); // <-- Use the tokens property
			}

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
