/**
 * @swagger
 * /globalban:
 *   post:
 *     summary: Ban a user from all servers the bot is in.
 *     description: Ban a user from all servers the bot is in. Requires an Authorization header with the bot token.
 *     tags:
 *       - Discord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userid
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to ban.
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *         required: false
 *         description: Reason for the ban.
 *     responses:
 *       '200':
 *         description: User was banned on all servers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: Result message.
 *                 user_was_in:
 *                   type: string
 *                   description: Number of servers the user was in.
 *                 user_found_on:
 *                   type: string
 *                   description: List of server names the user was found on.
 *       '400':
 *         description: Missing userid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       '401':
 *         description: Missing Authorization header.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */

const { Client, GatewayIntentBits } = require('discord.js');

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const client = new Client({ intents });

const globalBan = async (req, res) => {
	try {
		const authtoken = req.headers.authorization;
		const userid = req.query.userid;
		const reason = req.query.reason || 'No reason provided';

		if (!authtoken) {
			res.status(401).json({ error: 'Missing Authorization header' });
			return;
		}
		if (!userid) {
			res.status(400).json({ error: 'Missing userid' });
			return;
		}

		try {
			await client.login(authtoken);
		} catch (err) {
			return res.status(500).json({ error: 'Bot login failure, please check your token.' });
		}

		const guilds = await client.guilds.fetch();
        const user = await client.users.fetch(userid);
        
        let count = 0;
        let userFoundOnGuild = '';

		for (let i = 0; i < guilds.size; i++) {
			const guildid = guilds.map((guild) => guild.id);
			const currentGuild = await client.guilds.fetch(guildid[i]);

			try {
				const member = await currentGuild.members.fetch(userid);
				if (member) {
                    userFoundOnGuild += `${currentGuild.name}, `;
                    count++;
				}
			} catch (err) {
			}
 			await currentGuild.bans.create(userid, { reason: reason });
		}
		return res.status(200).json({ result: `${user.username} was banned on all servers`, user_was_in: `${count} out of ${guilds.size} servers`,  user_found_on: userFoundOnGuild });
	} catch (err) {
		console.error('Error:', err);
		return res.status(500).json({ error: 'Failure. Please check that your bot is in at least 1 server and the userid is correct.' });
	}
};

module.exports = globalBan;
