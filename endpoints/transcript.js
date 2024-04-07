/**
 * @swagger
 * /transcript:
 *   post:
 *     summary: Generates HTML transcripts for Discord tickets. - Contact @therealdax on Discord for more information
 *     tags: [Discord]
 *     description: |
 *       This endpoint is reserved for special use cases. Please contact @therealdax on Discord for more information
 *
 *       **Note**: The details of this endpoint are not provided in the Swagger documentation. Reach out to @therealdax for assistance and guidance.
 *
 *
 *       **Important**: Use this endpoint with caution and ensure you have the necessary knowledge and understanding before utilizing it.
 *     responses:
 *       200:
 *         description: Successful request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Placeholder response
 *                   example: "This is a placeholder response"
 */

const cheerio = require('cheerio');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const isBanned = require('../banned.js');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Endpoint to add content to transcripts
const transcript = async (req, res) => {
	const { serverid, channelid, messageid, content, close, channelname, user, usericon, eventtype, emoji } = req.body;
	const bucketName = process.env.BUCKET_NAME;
	const s3Key = `transcripts/${serverid}-${channelid}.html`;
	const timeNow = new Date();
	const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

	if (!serverid || !channelid) {
		res.status(400).json({ error: 'Missing required parameters. Please ensure you are using serverid and channelid parameters in all requests' });
		return;
	} else if (typeof serverid == 'number' || typeof channelid == 'number' || typeof messageid == 'number') {
		console.log(`User attempted to transcript without quotes - ServerID: ${serverid}`);
		return res.status(400).json({ error: 'Serverid or channelid or messageid missing "" (quotes) in value.' });
	}

	const banned = await isBanned(serverid);
	if (banned) {
		console.log(`BANNED USER: ${serverid}`);
		return res.status(401).json({ error: 'You are banned from using this endpoint.' });
	}

	console.log(`Server ID: ${serverid}, Channel ID: ${channelid}`);
	try {
		// Retrieve the existing transcript file from S3 or create a new one if it doesn't exist
		const getObjectCommand = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
		const existingObject = await s3Client.send(getObjectCommand);

		// Stream and collect the existing content
		const chunks = [];
		existingObject.Body.on('data', (chunk) => {
			chunks.push(chunk);
		});

		existingObject.Body.on('end', async () => {
			const existingContent = Buffer.concat(chunks).toString();
			const $ = cheerio.load(existingContent, { decodeEntities: false });

			let updatedContent;
			let match = false;

			if (!eventtype) {
				// Check if messageid exists in the existing content
				const messageSelector = `.messages .msg:has(.hidden:contains(${messageid}))`;
				const messageElement = $(messageSelector);

				if (messageElement.length > 0) {
					// If messageid exists, update the content of the message
					const editedContent = `<p><strong><font color="#fcba03">Message was edited:</font></strong> ${content}</p>`;
					const lastEditElement = messageElement.find('.right p:contains("Message was edited:")').last();

					if (lastEditElement.length > 0) {
						lastEditElement.after(editedContent);
					} else {
						messageElement.find('.right p').last().after(editedContent);
					}
					match = true;
				}
			} else if (eventtype === 'delete') {
				// Check if messageid exists in the existing content
				const messageSelector = `.hidden:contains(${messageid})`;
				const messageElement = $(messageSelector);

				if (messageElement.length > 0) {
					// If messageid exists and eventtype = delete, mark the message as deleted
					const editedContent = `<p><strong><font color="#f0210a">This message was deleted.</font></strong></p>`;
					messageElement.after(editedContent);
					match = true;
				}
			} else if (eventtype === 'reaction') {
				// Check if messageid exists in the existing content
				const messageSelector = `.hidden:contains(${messageid})`;
				const messageElement = $(messageSelector);

				if (messageElement.length > 0) {
					// If messageid exists and eventtype = reaction, mark the message as being reacted to
					const editedContent = `<p><strong><font color="#72d92e">A reaction was added by ${user}: ${emoji}</font></strong></p>`;
					messageElement.after(editedContent);
					match = true;
				}
			}

			if (!match) {
				const newMessageContent = `
            <div class='msg'>
              <div class='left'><img src='${usericon}'></div>
              <div class='right'>
                <div><a>${user}</a><a>${timeNow}</a></div>
                <p>${content}</p>
                <span class='hidden'>${messageid}</span>
              </div>
            </div>
          `;
				$('.messages').append(newMessageContent);
			}

			updatedContent = $.html();

			// Upload the updated content to S3
			if (content && !close) {
				const putObjectCommand = new PutObjectCommand({
					Bucket: bucketName,
					Key: s3Key,
					Body: updatedContent,
					ContentType: 'text/html; charset=utf-8',
				});
				await s3Client.send(putObjectCommand);
			}

			if (close) {
				const putObjectCommand = new PutObjectCommand({
					Bucket: bucketName,
					Key: s3Key,
					Body: updatedContent,
					ContentType: 'text/html; charset=utf-8',
				});
				await s3Client.send(putObjectCommand);

				res.json({ message: 'Transcript closed and updated.', url });
			} else {
				res.json({ message: 'Transcript updated.', url });
			}
		});
	} catch (error) {
		// Create a new transcript file if it doesn't exist
		if (error.name === 'NoSuchKey') {
			const fileContent = `<ticket-info>
        Ticket Creator | ${user}
        Ticket Name    | ${channelname}
        Created        | ${timeNow}
    </ticket-info>
            <!DOCTYPE html><html><head><style>@import url(https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&display=swap);ticket-info{display:none}body{background-color:#181d23;color:#fff;font-family:Rajdhani,sans-serif;margin:50px}.header h2{font-weight:400;text-transform:capitalize;margin-bottom:0;color:#fff}.header p{font-size:14px}.header .header-container .header-item{margin-right:25px;display:flex;align-items:center}.header .header-container{display:flex}.header .header-container .header-item a{margin-right:7px;padding:6px 10px 5px;background-color:#f45142;border-radius:3px;font-size:12px}.messages{margin-top:30px;display:flex;flex-direction:column}.messages .msg{display:flex;margin-bottom:31px}.messages .msg .left img{border-radius:100%;height:50px}.messages .msg .left{margin-right:20px}.messages .msg .right a:first-child{font-weight:400;margin:0 15px 0 0;font-size:19px;color:#fff}.messages .msg .right a:nth-child(2){text-transform:capitalize;color:#fff;font-size:12px}.messages .msg .right div{display:flex;align-items:center;margin-top:5px}.messages .msg .right p{margin:10px 0 0;white-space:normal;line-height:2;color:#fff;font-size:15px;max-width:700px}@media only screen and (max-width:600px){body{margin:0;padding:25px;width:calc(100% - 50px)}.ticket-header h2{margin-top:0}.ticket-header .children{display:flex;flex-wrap:wrap}} .hidden {display: none;}</style><title>Transcript | ${channelname}</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet"></head><body><div class='header'>
                <h2>Transcript for <b>${channelname}</b></h2>
                <div class='header-container'>
                    <div class='header-item'><a>Created: </a><p>${timeNow}</p></div>
                    <div class='header-item'><a>User: </a><p>${user}</p></div>
                </div>
            </div><div class='messages'><div class='msg'>
                    <div class='left'><img
                        src='${usericon}'>
                    </div>
                    <div class='right'>
                        <div><a>${user}</a><a>${timeNow}</a></div>
                        <p>${content}</p>
                        <span class='hidden'>${messageid}</span>
                    </div>
                </div>`;

			const putObjectCommand = new PutObjectCommand({ Bucket: bucketName, Key: s3Key, Body: fileContent, ContentType: 'text/html' });
			await s3Client.send(putObjectCommand);

			return res.json({ message: 'Transcript created.', url });
		} else {
			console.error(`Error updating transcript: ${error.message}`);
			return res.status(500).json({ error: 'Failed to update transcript.' });
		}
	}
};

module.exports = transcript;
