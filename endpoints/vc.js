const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages];
const client = new Client({ intents });

// Join voice channel
const connectToVoiceChannel = async (channel) => {
    try {
        console.log('Connecting to voice channel...');
        console.log('Bot logged in successfully.');
    const voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    /* Log the connection status at different points
    console.log('Connecting state:', voiceConnection.state.status);
     Add stateChange event listener
    voiceConnection.on('stateChange', (newState) => {
        console.log('Connection state changed. New state:', newState.status);
    });*/
    
    return voiceConnection;
    } catch (error) {
    console.error('Failed to join voice channel', error);
    throw new Error('Failed to join voice channel');
    }
};

const vc = async (req, res) => {
  const { token, channelid, serverid, deleteafter = false, disconnect = false } = req.body;

  if (!token || !channelid || !serverid) {
    res.status(400).json({ error: 'Missing required parameters. Please ensure you are using token, serverid, and channelid parameters.' });
    return;
  }

  try {
    await client.login(token);
    console.log('Bot logged in successfully.');

    const guild = await client.guilds.fetch(serverid);
    const channel = await guild.channels.fetch(channelid);
    console.log('Voice channel fetched:', channel.name);

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    if (channel.type !== ChannelType.GuildVoice) {
      res.status(400).json({ error: 'Invalid channel type' });
      return;
    }

    if (disconnect) {
      const connection = client.voice.connections.get(guild.id);
      if (connection && connection.joinConfig.channelid == channel.id) {
        connection.destroy();
        client.destroy();
        res.json({ message: 'Disconnected from voice channel successfully' });
        return;
      }
    }

    const connection = await connectToVoiceChannel(channel, token);
    console.log('Bot joined voice channel successfully.');

    res.json({ message: 'Joined voice channel successfully' });

    let checkInterval;
    let timeoutInterval;

    // Check if the bot is alone in the voice channel every 5 minutes
    const checkAloneInChannel = () => {
        if (!connection || connection.state.status == 'destroyed') {
            clearInterval(checkInterval);
            clearInterval(timeoutInterval);
            return;
          }   

        if (
            connection.joinConfig.channelId == channel.id &&
            (connection.state.status == 'connecting' || connection.state.status == 'ready')
          ) {
            const membersInChannel = channel.members.filter((member) =>
            member.voice.channelId == connection.joinConfig.channelId
      );
      const userCount = membersInChannel.size;
      console.log("Checking Usercount: " + userCount);

      if (userCount <= 1) {
        connection.destroy();
        console.log("Alone in channel detected: " + connection.state.status)

          if (deleteafter) {
            channel.delete();
          }

          clearInterval(checkInterval);
          clearInterval(timeoutInterval);
          client.destroy();
          console.log("Client destroyed.")
      }
    }
  };

  const timeoutFunction = () => {
    if (!connection || connection.state.status === 'destroyed') {
      clearInterval(checkInterval);
      clearInterval(timeoutInterval);
      client.destroy(); // Log out the Discord bot
      return;
    }
  
    connection.destroy();
  
    if (deleteafter) {
      channel.delete();
    }
  
    clearInterval(checkInterval);
    clearInterval(timeoutInterval);
    client.destroy(); // Log out the Discord bot
  };
  
  checkInterval = setInterval(checkAloneInChannel, 5 * 60 * 1000); // 5 minutes check users in channel
  timeoutInterval = setInterval(timeoutFunction, 60 * 60 * 1000); // 1 hour timeout
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = vc;
