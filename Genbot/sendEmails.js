const { google } = require('googleapis');
const { getDB } = require('../functions/connectToDatabase');
const Base64 = require('js-base64').Base64;
const fs = require('fs');

const sendEmails = async (req, res) => {
	const { threadId, message, email } = req.body;

	const oauth2Client = new google.auth.OAuth2(process.env.G_CLIENT_ID, process.env.G_CLIENT_SECRET, process.env.G_REDIRECT_URL);

	const db = await getDB('gmailDiscord');
	const usersCollection = db.collection('users');
	//const emailCollection = db.collection('emails');
	const user = await usersCollection.findOne({ email: email });
	if(!user) {
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

	const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
	// create a base64url encoded string
	const encodedMessage = Base64.encodeURI(`Content-Type: text/plain; charset=UTF-8\n\n${message}`);

	try {
		await gmail.users.messages.send({
			userId: 'me',
			requestBody: {
				raw: encodedMessage,
				threadId: threadId,
			},
		});

		res.status(200).send('Email sent successfully.');
	} catch (err) {
		console.error('Error sending email:', err);
		res.status(500).send('Error sending email.');
	}
};

module.exports = sendEmails;