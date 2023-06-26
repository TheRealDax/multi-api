const {Client, GatewayIntentBits, User} = require('discord.js');
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

  const { serverid, userid, roleid, time } = req.body;

  if (!serverid || !userid || !roleid) {
    return res.status(400).json({ error: 'Missing serverid or userid or roleid' });
  }
  else if (typeof serverid == 'number' || typeof roleid == 'number' || typeof userid == 'number'){
    return res.status(400).json({ error: 'Serverid or roleid or userid missing \"\" (quotes) in value.' });
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