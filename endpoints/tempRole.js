/**
 * @swagger
 * /temprole:
 *   get:
 *     summary: Assign a temporary role to a user for a specified duration
 *     tags: [Discord]
 *     description: Assigns a temporary role to a user in a specified guild for a specified duration.
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serverid
 *         in: query
 *         description: The ID of the Discord server
 *         required: true
 *         schema:
 *           type: string
 *           example: 335777177704595467
 *       - name: userid
 *         in: query
 *         description: The ID of the Discord user
 *         required: true
 *         schema:
 *           type: string
 *           example: 225647195771240448
 *       - name: roleid
 *         in: query
 *         description: The ID of the role to assign temporarily
 *         required: true
 *         schema:
 *           type: string
 *           example: 1104723387034636318
 *       - name: time
 *         in: query
 *         description: The duration of the temporary role (format&#58 Xs, Xm, Xh)
 *         required: true
 *         schema:
 *           type: string
 *           example: 20s
 *     responses:
 *       200:
 *         description: Successful request
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Role added to user for n seconds/minutes/hours
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Internal server error
 */

const {Client, GatewayIntentBits} = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];

const client = new Client({ intents });

function parseTimeToMilliseconds(time) {
    const timeRegex = /^(\d+)([smh])$/;
    const matches = time.match(timeRegex);
    
    if (!matches) {
      throw new Error('Invalid time format. Expected format: Xs, Xm or Xh');
    }
  
    const value = parseInt(matches[1]);
    const unit = matches[2];
  
    if (unit === 's') {
      return value * 1000; // Convert seconds to milliseconds
    } else if (unit === 'm') {
        return value * 60000; // Convert minutes to milliseconds
    } else if (unit === 'h') {
      return value * 3600000; // Convert hours to milliseconds
    }
  
    throw new Error('Invalid time unit. Only s (seconds) m (minutes) and h (hours) are supported.');
  }

// Gets the number of members who have a role
const tempRole = async (req, res) => {

  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { serverid, userid, roleid, time } = req.query;

  console.log(serverid, userid, roleid, time);

  if (!serverid || !userid || !roleid) {
    return res.status(400).json({ error: 'Missing serverid or userid or roleid' });
  }

  try {
    // Check if the bot is already logged in
    if (!client.readyAt) {

      await client.login(authToken);
      console.log("Logging in...")
    }

    const guild = await client.guilds.fetch(serverid);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Fetch members and roles to populate the cache
    await guild.members.fetch();
    await guild.roles.fetch();

    const member = guild.members.cache.find(member => member.user.id === userid);
    const roleId = guild.roles.cache.find(roles => roles.id === roleid);

    const user = member.user.id
    const role = roleId.id

    guild.members.addRole({ user, role });

    const timeout = parseTimeToMilliseconds(time);

    const removeRole = () => {
        guild.members.removeRole({ user, role });        
        clearInterval(removeRoleFunction);
        return;
    }


    removeRoleFunction = setInterval(removeRole, timeout);

    return res.json( 'Role added to user.' );
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = tempRole;