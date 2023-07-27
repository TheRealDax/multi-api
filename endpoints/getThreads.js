const { Client, GatewayIntentBits } = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];

const client = new Client({ intents });

const getThreads = async (req, res) => {
	const authToken = req.headers.authorization;
	if (!authToken) {
		return res.status(401).json({ error: 'Missing Authorization header. Please use a Discord bot token.' });
	}
	const serverid = req.query.serverid;
	if (!serverid) {
		return res.status(400).json({ error: 'Missing serverid' });
	}
	const channelid = req.query.channelid;
	if (!channelid) {
		return res.status(400).json({ error: 'Missing channelid' });
	}
    const name = req.query.name;
    if (!name) {
        return res.status(400).json({ error: 'Missing name' });
    }
	try {
		await client.login(authToken);

		try {
			const guild = await client.guilds.fetch(serverid);
			if (guild) {
				const channel = await guild.channels.fetch(channelid);
				if (!channel) {
					return res.status(200).json({ error: 'Channel not found' });
				} else {
					const threads = await guild.channels.fetchActiveThreads();
                    const threadMatch = threads.threads.find((thread) => thread.parentId === channelid && thread.name.toLowerCase().includes(name.toLowerCase()));
                    if (threadMatch) {
                        return res.status(200).json({ thread: threadMatch.id, name: threadMatch.name });
                    }
                    return res.status(404).json({ thread:null, name: null });
				}
			} else {
				return res.status(404).json({ error: 'Guild not found' });
			}
		} catch (error) {
			return res.status(500).json({ error: error.message });
		}
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

module.exports = getThreads;
