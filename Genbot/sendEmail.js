const db = require('../functions/db').getDb();
const { google } = require('googleapis');
const moment = require('moment');
const Base64 = require('js-base64').Base64;

const sendEmails = async (req, res) => {
	try {
		const { messageid, replymessage, account } = req.body;
		const user = await db.collection('users').find({ email: account }).toArray();
		const accessToken = user[0].accessToken;
		const refreshToken = user[0].refreshToken;
		const expiryDate = user[0].expires_in;

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
				db.collection('users').findOneAndUpdate({ email: account }, { $set: { accessToken: tokens.access_token, expires_in: tokens.expiry_date } });
			});
		} else {
		}

		const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
		//find message by id
		gmail.users.messages.get(
			{
				userId: 'me',
				id: messageid,
				format: 'full',
			},
			async (err, response) => {
				if (err) {
					console.log(err);
				}
				const email = response.data;
				const headers = email.payload.headers;
				let subject = headers.find((header) => header.name === 'Subject');
				//check if subject starts with RE: if not add it
				if (!subject.value.startsWith('RE:')) {
					subject.value = `RE: ${subject.value}`;
				}
                const threadId = email.threadId;
				const from = headers.find((header) => header.name === 'From');
				const date = headers.find((header) => header.name === 'Date');
				const to = headers.find((header) => header.name === 'To');

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
				decodedBody = Buffer.from(bodyData, 'base64').toString();
                const currentDate = new Date();
                const utcDate = currentDate.toUTCString();

				const emailHeaders = [
                    `From: ${toName} <${toEmail}>`,
					`To: ${fromName} <${fromEmail}>`,
					`Subject: ${subject.value}`,
                    `Date: ${utcDate}`,
                ].join('\r\n');

				const quoted = `On ${date.value}, ${from.value} wrote:\n> ${decodedBody.replace(/\n/g, '\n> ')}`;
				const replyMessage = `${emailHeaders}\r\n\r\n${replymessage}\n\n${quoted}`;
				const encodedReply = Base64.encodeURI(replyMessage);

				// send the email
				gmail.users.messages.send(
					{
						userId: 'me',
						resource: {
							raw: encodedReply,
                            threadId: threadId,
						},
					},
					(err, response) => {
						if (err) {
							console.log(err);
						}
                        //mark original email as read
                        gmail.users.messages.modify(
                            {
                                userId: 'me',
                                id: messageid,
                                resource: {
                                    removeLabelIds: ['UNREAD'],
                                },
                            },
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
					}
				);
			}
		);
	} catch (err) {
		console.log(err);
	}
    res.status(200).json('Email sent successfully.');
};

module.exports = sendEmails;
