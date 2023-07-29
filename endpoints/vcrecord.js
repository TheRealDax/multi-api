// API endpoint using express that takes serverid, channelid as query parameters and connects to discord

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceReceiver } = require('@discordjs/voice');

const TOKEN_REGEX = /^Bot\s[a-zA-Z0-9_.-]+$/; // Regular expression pattern for token validation

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages];
const clients = {};
const connections = [];

// function to subscribe to audio
const subscribeToAudio = (connection) => {
    const { voiceConnection } = connection;
  
    // Create a VoiceReceiver and subscribe to the audio
    const receiver = new VoiceReceiver(voiceConnection);
    receiver.subscribe();
  
    // Add event listeners for voice state updates
    const guild = voiceConnection.joinConfig.guildId;
    const channel = voiceConnection.joinConfig.channelId;
  
    // This event listener will trigger when a member joins a voice channel
    voiceConnection.on('stateChange', (oldState, newState) => {
      if (
        newState.guild.id === guild &&
        newState.channelId === channel &&
        newState.member &&
        newState.member.id !== voiceConnection.joinConfig.userId // Avoid subscribing to the bot's own audio
      ) {
        if (newState.status === 'joined') {
          // A new member joined the voice channel, subscribe to their audio
          receiver.subscribeToUser(newState.member.id);
        } else if (newState.status === 'left') {
          // A member left the voice channel, unsubscribe from their audio
          receiver.unsubscribeFromUser(newState.member.id);
        }
      }
    });
  
    // Add event listener to handle bot reconnects (to re-subscribe to audio for existing members)
    voiceConnection.on('reconnect', () => {
      const membersInChannel = voiceConnection.joinConfig.channel.members.filter(
        (member) => member.voice.channelId === channel
      );
      membersInChannel.forEach((member) => {
        if (member.id !== voiceConnection.joinConfig.userId) {
          receiver.subscribeToUser(member.id);
        }
      });
    });
  };

// Join voice channel
const connectToVoiceChannel = async (channel) => {
    try {
        console.log('Connecting to voice channel...');
    const voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const connection = {
      serverId: channel.guild.id,
      channelId: channel.id,
      voiceConnection,
    };

    connections.push(connection);
    return voiceConnection;

    } catch (error) {
    console.error('Failed to join voice channel', error);
    throw new Error('Failed to join voice channel');
    }
};

// Disconnect from voice channel
const disconnectFromVoiceChannel = (channel, serverId) => {
  const index = connections.findIndex((connection) => connection.serverId === serverId && connection.channelId === channel.id);

  if (index !== -1) {
    const connection = connections[index];
    connection.voiceConnection.disconnect();
    connections.splice(index, 1);
    console.log('Disconnected from voice channel successfully.');
  }
};

const vc = async (req, res) => {
  const { authorization: token } = req.headers;

  const channelid = req.query.channelid;
  const serverid = req.query.serverid;
  const deleteafter = req.query.deleteafter || false;
  const disconnect = req.query.disconnect || false;

  if (!channelid || !serverid) {
    res.status(400).json({ error: 'Missing required parameters. Please ensure you are using token, serverid, and channelid parameters.' });
    return;
  }

  if (!TOKEN_REGEX.test(token)) {
    res.status(400).json({ error: 'Invalid token format. Please provide a valid Discord bot token.' });
    return;
  }

  try {
    let client = clients[serverid];

    if (!client) {
      client = new Client({ intents });
      clients[serverid] = client;
      await client.login(token);
      //console.log('Bot logged in successfully for server', serverid);

  } else {
      //console.log('Bot is already logged in for server', serverid);
  }

    const guild = await client.guilds.fetch(serverid);
    const channel = await guild.channels.fetch(channelid);
    //console.log('Voice channel fetched:', channel.name);

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    if (channel.type !== ChannelType.GuildVoice) {
      res.status(400).json({ error: 'Invalid channel type' });
      return;
    }

    if (disconnect) {
      disconnectFromVoiceChannel(channel, serverid);

        if (deleteafter) {
          channel.delete();
          console.log('Deleting channel...')
        }

        res.json({ message: 'Disconnected from voice channel successfully' });
        return;
      }

    const [connection] =  await connectToVoiceChannel(channel, serverid)
    //after connecting to voice channel, subscribe to audio for all existing users in the voice channel and all new joiners and unscribe when they leave
    subscribeToAudio(connection);


    //console.log('Joined voice channel successfully.');

    res.json({ message: 'Joined voice channel successfully' });

    let checkInterval;
    let timeoutInterval;

    // Check if the bot is alone in the voice channel every 5 minutes
    const checkAloneInChannel = () => {
      const connection = connections.find((connection) => connection.serverId === serverid && connection.channelId === channelid);
        if (!connection || connection.voiceConnection.state.status == 'destroyed') {
            clearInterval(checkInterval);
            clearInterval(timeoutInterval);
            return;
          }   

        const membersInChannel = channel.members.filter((member) => member.voice.channelId == connection.voiceConnection.joinConfig.channelId
      );
      const userCount = membersInChannel.size;
      console.log("Checking Usercount: " + userCount);

      if (userCount <= 1) {
        disconnectFromVoiceChannel(channel, serverid);
        console.log("Alone in channel detected, disconnecting...")

          if (deleteafter) {
            channel.delete();
            console.log('Deleting channel...')
          }

          clearInterval(checkInterval);
          clearInterval(timeoutInterval);
          console.log("Client destroyed.")
      }
    };

  const timeoutFunction = () => {
    const connection = connections.find((connection) => connection.serverId === serverid && connection.channelId === channelid);
    if (!connection || connection.voiceConnection.state.status === 'destroyed') {
      clearInterval(checkInterval);
      clearInterval(timeoutInterval);
      return;
    }

    disconnectFromVoiceChannel(channel, serverid);
  
    if (deleteafter) {
      channel.delete();
    }
  
    clearInterval(checkInterval);
    clearInterval(timeoutInterval);
  };
  
  if (!disconnect) {
  checkInterval = setInterval(checkAloneInChannel, 5 * 60 * 1000); // 5 minutes check users in channel
  timeoutInterval = setInterval(timeoutFunction, 60 * 60 * 1000); // 1 hour timeout
    }
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = vc;