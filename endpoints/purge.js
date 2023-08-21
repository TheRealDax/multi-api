/**
 * @swagger
 * /purge:
 *   get:
 *     summary: Purge messages from a Discord text channel
 *     tags: [Discord]
 *     description: Purge a specified number of messages from a Discord text channel.
 *     parameters:
 *       - in: header
 *         name: authorization
 *         description: The authorization token for accessing the Discord API.
 *         required: true
 *         type: string
 *       - in: query
 *         name: serverid
 *         description: The ID of the server (guild) where the text channel belongs.
 *         required: true
 *         type: string
 *       - in: query
 *         name: channelid
 *         description: The ID of the text channel to purge messages from.
 *         required: true
 *         type: string
 *       - in: query
 *         name: count
 *         description: The number of messages to purge (maximum 100).
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully purged the specified number of messages.
 *         content:
 *           application/json:
 *             example:
 *               message: Purged 50 messages
 *       400:
 *         description: Bad request or specific error, such as not a text channel, count over 100, or messages too old to bulk delete.
 *         content:
 *           application/json:
 *             example:
 *               error: You can only bulk delete messages that are under 14 days old
 *       500:
 *         description: Internal server error occurred.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 */

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages];

const client = new Client({ intents });

const purge = async (req, res) => {
    const token = req.headers.authorization;
    const serverid = req.query.serverid;
    const channelid = req.query.channelid;
    const count = req.query.count || 10;

    try {
        await client.login(token);
        const guild = await client.guilds.fetch(serverid);
        const channel = await guild.channels.fetch(channelid);

        if (channel.type !== ChannelType.GuildText) {
            res.status(400).json({ error: 'Not a text channel' });
            return;
        }

        if (count > 100) {
            res.status(400).json({ error: 'Count must be less than 100' });
            return;
        }

        const messages = await channel.messages.fetch({ limit: count });
        await channel.bulkDelete(messages);

        return res.status(200).json({ message: `Purged ${count} messages` });
    } catch (err) {
        if (err.code === 50034) {
            return res.status(400).json({ error: 'You can only bulk delete messages that are under 14 days old' });
        }
        console.error('Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = purge;