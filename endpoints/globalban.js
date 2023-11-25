/**
 * @swagger
 * /globalban:
 *   get:
 *     summary: Ban or unban a user from all servers the bot is in.
 *     tags: [Discord]
 *     description: Ban or unban a user from all servers the bot is in. This endpoint requires an Authorization header with a valid Discord bot token.
 *     parameters:
 *       - name: userid
 *         in: query
 *         description: The ID of the user to ban or unban.
 *         required: true
 *         schema:
 *           type: string
 *       - name: reason
 *         in: query
 *         description: The reason for the ban. Defaults to "No reason provided".
 *         required: false
 *         schema:
 *           type: string
 *       - name: unban
 *         in: query
 *         description: Whether to unban the user instead of banning them. Defaults to false.
 *         required: false
 *         schema:
 *           type: boolean
 *     responses:
 *       '201':
 *         description: The user was banned or unbanned on all servers the bot is in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: A message indicating the ban was successful.
 *                 user_was_in:
 *                   type: string
 *                   description: The number of servers the user was in.
 *                 user_found_on:
 *                   type: string
 *                   description: The names of the servers the user was found on.
 *       '200':
 *         description: The user was banned or unbanned on some servers, but not all.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: A message indicating the ban was partially successful.
 *                 failed_count:
 *                   type: string
 *                   description: The number of servers the ban failed on.
 *                 failed_servers:
 *                   type: string
 *                   description: The names of the servers the ban failed on.
 *       '401':
 *         description: The Authorization header is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A message indicating the error.
 *       '400':
 *         description: The userid parameter is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A message indicating the error.
 *       '500':
 *         description: The bot login failed or the userid is incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A message indicating the error.
 */

const { Client, GatewayIntentBits } = require('discord.js');

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const client = new Client({ intents });

const globalBan = async (req, res) => {
	try {
		const authtoken = req.headers.authorization;
		const userid = req.query.userid;
		const reason = req.query.reason || 'No reason provided';
		const unban = req.query.unban || false;
		const kick = req.query.kick || false;

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
		let failureCount = 0;
		let failures = '';

		for (let i = 0; i < guilds.size; i++) {
			const guildid = guilds.map((guild) => guild.id);
			const currentGuild = await client.guilds.fetch(guildid[i]);

			try {
				const member = await currentGuild.members.fetch(userid);
				if (member) {
					userFoundOnGuild += `${currentGuild.name}, `;
					count++;
				}
			} catch (err) {}
			if (unban) {
				try {
					await currentGuild.bans.remove(userid);
				} catch (err) {
					failures += `${currentGuild.name}, `;
					failureCount++;
					continue;
				}
			} else if (!unban && kick) {
				try {
					await currentGuild.members.kick(userid, { reason: reason });
				} catch (err) {
					failures += `${currentGuild.name}, `;
					failureCount++;
					continue;
				}
			}
			 else {
				try {
					await currentGuild.bans.create(userid, { reason: reason });
				} catch (err) {
					failures += `${currentGuild.name}, `;
					failureCount++;
					continue;
				}
			}
		}
		if (unban) {
			if (failureCount > 0) {
				client.destroy();
				return res.status(200).json({ result: `${user.username} was unbanned on ${guilds.size - failureCount} servers`, failed_count: `${failureCount} out of ${guilds.size} servers`, failed_servers: failures });
			}else {
				return res.status(201).json({ result: `${user.username} was unbanned on ${guilds.size} servers` });
			}
		} if (!unban && kick) {
			if (failureCount > 0) {
				client.destroy();
				return res.status(200).json({ result: `${user.username} was kicked on ${guilds.size - failureCount} servers`, failed_count: `${failureCount} out of ${guilds.size} servers`, failed_servers: failures });
			}else {
				client.destroy();
				return res.status(201).json({ result: `${user.username} was kicked on ${guilds.size} servers` });
			}
		}
		if (failureCount > 0) {
			client.destroy();
			return res.status(200).json({ result: `${user.username} was banned on ${guilds.size - failureCount} servers`, failed_count: `${failureCount} out of ${guilds.size} servers`, failed_servers: failures });
		} else {
			client.destroy();
			return res.status(201).json({ result: `${user.username} was banned on ${guilds.size} servers`, user_was_in: `${count} out of ${guilds.size} servers`, user_found_on: userFoundOnGuild });
		}
	} catch (err) {
		client.destroy();
		console.error('Error:', err);
		return res.status(500).json({ error: 'Failure. Please check that your bot is in at least 1 server and the userid is correct.' });
	}
};

module.exports = globalBan;
