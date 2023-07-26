const db = require('../functions/db').getDb();
const axios = require('axios');
const { google } = require('googleapis');
const moment = require('moment');

async function getEmails(req, res) {
	const users = await db.collection('users').find({}).toArray();
	users.forEach((user) => {
		const accessToken = user.accessToken;
		const refreshToken = user.refreshToken;
		const expiryDate = user.expires_in;

		const oauth2Client = new google.auth.OAuth2(process.env.G_CLIENT_ID, process.env.G_CLIENT_SECRET, process.env.G_REDIRECT_URL);

		oauth2Client.setCredentials({
			access_token: accessToken,
			refresh_token: refreshToken,
		});

		const isExpired = moment().valueOf() > expiryDate - 300000;
		if (isExpired) {
			oauth2Client.refreshAccessToken((err, tokens) => {
				if (err) {
					console.log(err);
				}
				db.collection('users').findOneAndUpdate({ googleId: user.googleId }, { $set: { accessToken: tokens.access_token, expires_in: tokens.expiry_date } });
				console.log('Access token refreshed');
			});
		} else {
			console.log('Access token is still valid');
		}

		const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

		gmail.users.messages.list(
			{
				userId: 'me',
				q: 'in:inbox is:unread',
			},
			(err, response) => {
				if (err) {
					console.log(err);
				}
				const messages = response.data.messages;
				if (messages.length) {
					messages.forEach((message) => {
						gmail.users.messages.get(
							{
								userId: 'me',
								threadId: message.threadId,
								id: message.id,
								format: 'full',
							},
							async (err, response) => {
								if (err) {
									console.log(err);
								}
								const isExisting = await db.collection('emails').findOne({ id: message.id }, (err, result) => {
									if (err) {
										console.log('Error finding email:', err);
									}
								});
								if (!isExisting) {
									const email = response.data;
									const headers = email.payload.headers;
									const subject = headers.find((header) => header.name === 'Subject');
									const from = headers.find((header) => header.name === 'From');
									const date = headers.find((header) => header.name === 'Date');
									const to = headers.find((header) => header.name === 'To');
									const url = `https://mail.google.com/mail/u/0/#inbox/${message.threadId}`;

									// extract names and emails seperately
									const reg = /(.*)<(.*)>/;
									const fromMatches = reg.exec(from.value);
									const toMatches = reg.exec(to.value);
									const fromEmail = (from.value = fromMatches[2] ? fromMatches[2].trim() : from.value);
									const fromName = (from.value = fromMatches[1] ? fromMatches[1].trim() : '');
									const toEmail = (to.value = toMatches[2] ? toMatches[2].trim() : to.value);
									const toName = (to.value = toMatches[1] ? toMatches[1].trim() : '');
									
									let part;
									//console.log(email.payload.parts);
									if (email.payload.parts) {
										// Find 'text/plain' part
										part = email.payload.parts.find((part) => part.mimeType === 'text/plain');
									}

									let bodyData = part ? part.body.data : email.payload.body.data;
									let decodedBody = '';

									if (bodyData) {
										decodedBody = Buffer.from(bodyData, 'base64').toString();
										if (decodedBody.length > 3000) {
											decodedBody = `Email body is over 3000 characters. Please view and respond to this email from Gmail.)`;
										}
									}
									const emailData = {
										id: email.id,
										threadId: email.threadId,
										date: date.value,
										from: from.value,
										subject: subject.value,
										//body: decodedBody, //! no need to store
									};
									db.collection('emails').insertOne({ googleId: user.googleId, ...emailData });
									console.log('Inserted email', email.id);

 									const webhookURL = 'https://api.botghost.com/webhook/1085132231015661578/t5g48sn530j2qjkce90iav'; //! Add webhook URL here
									const header = {
										Authorization: process.env.BG_API_KEY_TEST,
										'Content-Type': 'application/json',
									};
									const reqBody = {
										variables: [
											{
												name: 'Email Sender',
												variable: '{email_sender}',
												value: `${fromEmail}`,
											},
											{
												name: 'Email Recipient',
												variable: '{email_recipient}',
												value: `${toEmail}`,
											},
											{
												name: 'Email Sender Name',
												variable: '{email_sender_name}',
												value: `${fromName}`,
											},
											{
												name: 'Email Recipient Name',
												variable: '{email_recipient_name}',
												value: `${toName}`,
											},
											{
												name: 'Email Subject',
												variable: '{email_subject}',
												value: `${subject.value}`,
											},
											{
												name: 'Email Body',
												variable: '{email_body}',
												value: `${decodedBody}`,
											},
											{
												name: 'Email ID',
												variable: '{email_id}',
												value: `${email.id}`,
											},
											{
												name: 'Thread ID',
												variable: '{thread_id}',
												value: `${email.threadId}`,
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
								} else {
									console.log('Email already exists in the database');
								}
							}
						);
					});
				}
			}
		);
	});
	res.send('Emails fetched');
}

module.exports = getEmails;
