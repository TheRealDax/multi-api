const { google } = require('googleapis');
const { getDB } = require('../functions/connectToDatabase');
const Base64 = require('js-base64').Base64;
const fs = require('fs');

const sendEmails = async (req, res) => {
	const { messageid, message } = req.body;

	const oauth2Client = new google.auth.OAuth2(process.env.G_CLIENT_ID, process.env.G_CLIENT_SECRET, process.env.G_REDIRECT_URL);

	const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
	const thread = await gmail.users.threads.get({ userId: 'me', id: messageid });
	const email = thread.data.messages[0].payload.headers.find((header) => header.name === 'From').value;
	const to = thread.data.messages[0].payload.headers.find((header) => header.name === 'To').value;
	const subject = thread.data.messages[0].payload.headers.find((header) => header.name === 'Subject').value;

	const db = await getDB('gmailDiscord');
	const usersCollection = db.collection('users');
	//const emailCollection = db.collection('emails');
	const user = await usersCollection.findOne({ email: email });
	if (!user) {
		console.error('User not found');
		res.status(404).send('Error sending email.');
		return;
	}

	let tokens = user.tokens;

	// Attempt to load the tokens from local storage.
	try {
		const tokensData = await fs.promises.readFile(`tokens_${user.email}.json`, 'utf8');
		tokens = JSON.parse(tokensData);
	} catch (err) {
		console.log('No local token found for user', user.email, '. Using tokens from database.');
	}

	oauth2Client.setCredentials(tokens);

	if (oauth2Client.isTokenExpiring()) {
		const refreshedTokens = await oauth2Client.refreshAccessToken();
		oauth2Client.setCredentials(refreshedTokens);

		// Update the tokens in the database and local storage
		await usersCollection.updateOne({ email: user.email }, { $set: { tokens: refreshedTokens } });
		await fs.promises.writeFile(`tokens_${user.email}.json`, JSON.stringify(refreshedTokens, null, 2));
	}

	const originalMessageResponse = await gmail.users.messages.get({
		userId: 'me',
		id: messageid,
		format: 'full',
	});

	const originalMessageData = originalMessageResponse.data.payload.body.data;
	const originalMessage = Buffer.from(originalMessageData, 'base64').toString('utf8');
	const originalMessageHeaders = originalMessageResponse.data.payload.headers;

	let originalFrom = '';
	let originalDate = '';
	for (let i = 0; i < originalMessageHeaders.length; i++) {
		if (originalMessageHeaders[i].name === 'From') {
			originalFrom = originalMessageHeaders[i].value;
		}
		if (originalMessageHeaders[i].name === 'Date') {
			originalDate = originalMessageHeaders[i].value;
		}
	}

	const quotedOriginalMessage = `On ${originalDate}, ${originalFrom} wrote:\n> ${originalMessage.replace(/\n/g, '\n> ')}`;
	const replyMessage = `${message}\n\n${quotedOriginalMessage}`;
	const encodedMessage = Base64.encodeURI(`To: ${to}\nContent-Type: text/plain; charset=UTF-8\nSubject: Re: ${subject}\n\n${replyMessage}`);

	try {
		await gmail.users.messages.send({
			userId: 'me',
			requestBody: {
				raw: encodedMessage,
				messageid: messageid,
			},
		});

		res.status(200).send('Email sent successfully.');
	} catch (err) {
		console.error('Error sending email:', err);
		res.status(500).send('Error sending email.');
	}
};

module.exports = sendEmails;
