const {Client, GatewayIntentBits} = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];

const client = new Client({ intents });

// Gets the number of members who have a role
const getMemberRoles = async (req, res) => {

  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { serverid, userid } = req.body;

  if (!serverid || !userid) {
    return res.status(400).json({ error: 'Missing serverid or userid' });
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

    // Get the role
    const member = guild.members.cache.get(userid);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Filter the members of the guild who have the specified role
    const roles = member.roles.cache.map(roles => roles.name);
    const roleids = member.roles.cache.map(roles => roles.id);
    const roletags = member.roles.cache.map(roles => `<@&${roles.id}>`);

    return res.json({ roles: roles, roleids: roleids, roletags: roletags });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getMemberRoles;