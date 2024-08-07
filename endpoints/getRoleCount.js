/**
 * @swagger
 * /getrolecount:
 *   get:
 *     summary: Get the number of members who have a role
 *     tags: [Discord]
 *     description: Retrieves the count and details of members who have a specific role in a Discord server.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: serverid
 *         description: The ID of the Discord server
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: '225647195771240448'
 *       - name: roleid
 *         description: The ID of the role
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: '1085199531081220136'
 *     responses:
 *       200:
 *         description: Successful request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       displayname:
 *                         type: string
 *                         description: The display name of the member
 *                       userid:
 *                         type: string
 *                         description: The ID of the member
 *                 count:
 *                   type: integer
 *                   description: The total count of members with the specified role
 *                 memberlist:
 *                   type: string
 *                   description: The comma-separated list of display names of members with the specified role
 *                 membertags:
 *                   type: string
 *                   description: The comma-separated list of member tags (`<@userID>`) with the specified role
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: Guild or role not found
 *       500:
 *         description: Internal server error
 */

const { Client, GatewayIntentBits } = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const isBanned = require('../banned.js');

const client = new Client({ intents });

// Gets the number of members who have a role
const getRoleCount = async (req, res) => {
	const authToken = req.headers.authorization;
	if (!authToken) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const { serverid, roleid } = req.query;

	if (!serverid || !roleid) {
		return res.status(400).json({ error: 'Missing serverid or roleid parameter' });
	}

	const banned = await isBanned(serverid);
	if (banned) {
		console.log(`BANNED USER: ${serverid}`);
		return res.status(401).json({ error: 'You are banned from using this endpoint.' });
	}

	try {
		await client.login(authToken);
		console.log(`Logged in as ${client.user.tag} - ${client.user.id}`);

		const guild = await client.guilds.fetch(serverid);
		console.log(`Fetching guild ${serverid}...`);

		await guild.members.fetch();
		const role = await guild.roles.fetch(roleid);

		// Filter the members of the guild who have the specified role
		const roleCount = guild.members.cache.filter((member) => member.roles.cache.has(role.id));
		const membersWithRole = roleCount.map((member) => ({ displayname: member.displayName, userid: member.id }));
		client.destroy();
		return res.status(200).json({ members: membersWithRole, count: roleCount.size });
	} catch (error) {
		console.error('Error:', error);
		return res.status(500).json({ error });
	}
};

module.exports = getRoleCount;
