const {Client, GatewayIntentBits} = require('discord.js');
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];

const client = new Client({ intents });

// Gets the number of members who have a role
const getRoleCount = async (req, res) => {

  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { serverid, roleid } = req.body;

  if (!serverid || !roleid) {
    return res.status(400).json({ error: 'Missing serverid or roleid' });
  }
  else if (typeof serverid == 'number' || typeof roleid == 'number'){
    return res.status(400).json({ error: 'Serverid or roleid missing \"\" (quotes) in value.' });
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
    const role = await guild.roles.cache.get(roleid);
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