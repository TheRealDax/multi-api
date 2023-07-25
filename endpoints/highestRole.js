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
		console.log('Logging in...');

		const discordUser = client.users.cache.get(userid);
		if (discordUser) {
			const guild = client.guilds.cache.get(serverid);
			const member = guild.members.cache.get(discordUser.id);
			if (member) {
				const highestRole = member.roles.highest.name;
                const highestRoleId = member.roles.highest.id;
				res.status(200).json({ Role: highestRole, RoleId: highestRoleId });
			} else {
				res.status(404).json({ error: 'Member not found' });
			}
		} else {
			res.status(404).json({ error: 'Discord user not found' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while fetching the highest role' });
	}
};
module.exports = highestRole;
