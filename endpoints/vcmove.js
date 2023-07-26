/**
 * @swagger
 * /moveUser:
 *   get:
 *     summary: Move a user to a different voice channel
 *     description: |
 *       Moves a user to a different voice channel in a Discord server.
 *       Requires a Discord bot token with the necessary permissions.
 *     parameters:
 *       - name: serverid
 *         in: query
 *         description: The ID of the Discord server
 *         required: true
 *         type: string
 *       - name: userid
 *         in: query
 *         description: The ID of the Discord user to move
 *         required: true
 *         type: string
 *       - name: channelid
 *         in: query
 *         description: The ID of the voice channel to move the user to
 *         required: true
 *         type: string
 *       - name: Authorization
 *         in: header
 *         description: The Discord bot token
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: User was moved successfully
 *         schema:
 *           type: object
 *           properties:
 *             result:
 *               type: string
 *               description: A message indicating that the user was moved successfully
 *       '400':
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: A message indicating the reason for the error
 *       '401':
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: A message indicating the reason for the error
 *       '404':
 *         description: Not found
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: A message indicating the reason for the error
 *       '500':
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: A message indicating the reason for the error
 */

const { Client, GatewayIntentBits } = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates];
const client = new Client({ intents });

const moveUser = async (req, res) => {
	const authToken = req.headers.authorization;
	if (!authToken) {
		return res.status(401).json({ error: 'Missing Authorization header. Please use a Discord bot token.' });
	}

	const serverid = req.query.serverid;
	if (!serverid) {
		return res.status(400).json({ error: 'Missing serverid' });
	}

	const userid = req.query.userid;
	if (!userid) {
		return res.status(400).json({ error: 'Missing userid' });
	}

	const channelid = req.query.channelid;
	if (!channelid) {
		return res.status(400).json({ error: 'Missing channelid' });
	}

	try {
		try {
			await client.login(authToken);
		} catch (error) {
			console.error('Error:', error);
			return res.status(500).json({ error: 'Error during login', error });
		}
		const server = await client.guilds.fetch(serverid);
		if (!server) {
			return res.status(404).json({ error: 'Guild not found' });
		}

		const member = await server.members.fetch(userid);
		if (!member) {
			return res.status(404).json({ error: 'Member not found' });
		}

		const channel = await server.channels.fetch(channelid);
		if (!channel) {
			return res.status(404).json({ error: 'Channel not found' });
		}

        if (!member.voice.channelId) {
            return res.status(404).json({ error: 'User is not in a voice channel' });
        }else if (member.voice.channelId === channelid){
            return res.status(400).json({ error: 'User is already in that voice channel' });
        }
        else{
            await member.voice.setChannel(channel);
            return res.status(200).json({ result: 'User was moved' });
        }

	} catch (err) {
		console.log(err);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

module.exports = moveUser;
