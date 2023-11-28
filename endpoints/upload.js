/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file to a Discord channel.
 *     description: |
 *       This endpoint allows you to upload a file to a specified Discord channel.
 *       The file can be an image, video, or any other supported file format.
 *       The file will be sent to the specified channel in the specified Discord server.
 *     tags: [Discord]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: The Discord bot token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *         example: Bot MTA4NTEzMjIzMTAxNTY2MTU3OA.GD9g-h.Mh2Z0yo-3SYe-Y
 *       - in: query
 *         name: serverid
 *         description: The ID of the Discord server where the file will be sent.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: channelid
 *         description: The ID of the Discord channel where the file will be sent.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: file
 *         description: The URL of the file to be uploaded. Must be a direct link to the file, eg. https://example.com/file.png.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The file was successfully uploaded to the Discord channel.
 *         content:
 *           application/json:
 *             example:
 *               result: File send successful
 *       '404':
 *         description: The file extension was not detected, and the file was sent as a URL.
 *         content:
 *           application/json:
 *             example:
 *               result: File extension was not detected, file was sent as a URL
 *       '500':
 *         description: An error occurred during the file upload process.
 *         content:
 *           application/json:
 *             example:
 *               error: Something went wrong
 */

const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages];
const { fromBuffer } = require('file-type-cjs-fix/file-type');

const upload = async (req, res) => {
	try {
		const { authorization: token } = req.headers;
		const serverid = req.query.serverid;
		const channelid = req.query.channelid;
		const file = req.query.file;
		const client = new Client({ intents });

		client.login(token);
		client.on('ready', () => {
			console.log(`Logged in ${client.user.id}`);
		});

		const guild = await client.guilds.fetch(serverid);
        console.log(`${guild.name} ${guild.id}`);
		const channel = await client.channels.fetch(channelid);
		const upload = await axios.get(file, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(upload.data);
		const fileType = await fromBuffer(buffer);
		if (fileType) {
			const attachment = new AttachmentBuilder(buffer, { name: `filename.${fileType.ext}` });
			await channel.send({
				files: [attachment],
			});
            return res.status(200).json({ result: 'File send successful' });
		} else {
			await channel.send(file);
            return res.status(404).json({ result: 'File extension was not detected, file was sent as a url' });
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Something went wrong: ', error });
	}
};

module.exports = upload;
