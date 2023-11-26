/**
 * @swagger
 * /highestrole:
 *    get:
 *     summary: Gets the highest role of a member in a Discord server
 *     tags: [Discord]
 *     description: Gets the highest role of a member in a Discord server
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: serverid
 *         description: The ID of the Discord server
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: '335777177704595467'
 *       - name: userid
 *         description: The ID of the Discord user
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: '225647195771240448'
 *     responses:
 *       200:
 *         description: Successful request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Role:
 *                   type: string
 *                   description: The name of the highest role
 *                 RoleId:
 *                   type: string
 *                   description: The ID of the highest role
 *       400:
 *         description: Missing serverid or userid
 *       401:
 *         description: Missing Authorization header
 *       404:
 *         description: Guild or Member not found
 *       500:
 *         description: Internal server error
 */

const { Client, GatewayIntentBits } = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];

const client = new Client({ intents });

const highestRole = async (req, res) => {
	const authToken = req.headers.authorization;
	if (!authToken) {
		return res.status(401).json({ error: 'Missing Authorization header. Please use a Discord bot token.' });
	}
	const serverid = req.query.serverid;
	const userid = req.query.userid;
	if (!serverid || !userid) {
		return res.status(400).json({ error: 'Missing serverid or userid' });
	}
	try {
		await client.login(authToken);

		const discordUser = await client.users.fetch(userid);
		if (discordUser) {
			const guild = await client.guilds.fetch(serverid);
			const member = await guild.members.fetch(discordUser.id);
			if (member) {
				const highestRole = member.roles.highest.name;
                const highestRoleId = member.roles.highest.id;
				const highestRolePosition = member.roles.highest.position;
				client.destroy();
				return res.status(200).json({ Role: highestRole, RoleId: highestRoleId, position: highestRolePosition });
			} else {
				client.destroy();
				return res.status(404).json({ error: 'Member not found' });
			}
		} else {
			client.destroy();
			return res.status(404).json({ error: 'Discord user not found' });
		}
	} catch (error) {
		client.destroy();
		console.error(error);
		res.status(500).json({ error: `${error}` });
	}
};
module.exports = highestRole;
