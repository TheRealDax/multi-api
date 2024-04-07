/**
 * @swagger
 * /memberroles:
 *   get:
 *     summary: Returns the roles of a user in a specific Discord server
 *     tags: [Discord]
 *     parameters:
 *       - in: query
 *         name: serverid
 *         schema:
 *           type: string
 *         required: true
 *         description: The server ID of the Discord server
 *       - in: query
 *         name: userid
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the Discord user
 *     responses:
 *       200:
 *         description: Successful Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                 roleids:
 *                   type: array
 *                   items:
 *                     type: string
 *                 roleidsformatted:
 *                   type: string
 *                   items:
 *                     type: string
 *                 roletags:
 *                   type: array
 *                   items:
 *                     type: string
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

// Gets the number of members who have a role
const memberRoles = async (req, res) => {
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

		const guild = await client.guilds.fetch(serverid);
		if (!guild) {
			return res.status(404).json({ error: 'Guild not found' });
		}

		// Fetch members and roles to populate the cache
		await guild.members.fetch();
		await guild.roles.fetch();

		// Get the user
		const member = guild.members.cache.get(userid);
		if (!member) {
			return res.status(404).json({ error: 'Member not found' });
		}

		// Filter the members of the guild who have the specified role
		const roles = member.roles.cache.filter((role) => role.id !== serverid).map((role) => role.name);
		const roleids = member.roles.cache.filter((role) => role.id !== serverid).map((role) => role.id);
		const roleidsFormatted = roleids.map((id) => `${id}`).join(', ');
		const roletags = member.roles.cache.filter((roles) => roles.id !== serverid).map((roles) => `<@&${roles.id}>`);
		client.destroy();
		return res.status(200).json({ roles: roles, roleids: roleids, roleidsformatted: roleidsFormatted, roletags: roletags, rolecount: roleids.length });
	} catch (error) {
		client.destroy();
		console.error('Error:', error);
		return res.status(500).json({ error: `${error}` });
	}
};

module.exports = memberRoles;
