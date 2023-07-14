/**
 * @swagger
 * /getrolecount:
 *   get:
 *     summary: Get the number of members who have a role
 *     tags: [Discord]
 *     description: Retrieves the count and details of members who have a specific role in a Discord server.
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
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

const {Client, GatewayIntentBits} = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];

const client = new Client({ intents });

// Gets the number of members who have a role
const getRoleCount = async (req, res) => {

  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { serverid, roleid } = req.query;

  if (!serverid || !roleid) {
    return res.status(400).json({ error: 'Missing serverid or roleid' });
  }

  try {
      await client.login(authToken);
      console.log("Logging in...")

    const guild = await client.guilds.fetch(serverid);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Fetch members and roles to populate the cache
    await guild.members.fetch();
    await guild.roles.fetch();

    // Get the role
    const role = guild.roles.cache.get(roleid);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Filter the members of the guild who have the specified role
    const roleCount = guild.members.cache.filter(member => member.roles.cache.has(role.id));
    const membersWithRole = roleCount.map(member => ({ displayname: member.displayName, userid: member.id }));
    const displayNames = roleCount.map(member => member.displayName).join(', ');
    const memberTags = roleCount.map(member => `<@${member.id}>`).join(', ');

    return res.json({members: membersWithRole, count: roleCount.size, memberlist: displayNames, membertags: memberTags });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getRoleCount;