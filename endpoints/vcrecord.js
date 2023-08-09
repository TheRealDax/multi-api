// API endpoint using express that takes serverid, channelid as query parameters and connects to discord

const { entersState, joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType, getVoiceConnection } = require('@discordjs/voice');
const { Client, GatewayIntentBits, ChannelType, AttachmentBuilder } = require('discord.js');
const prism = require('prism-media');
const fs = require('fs');
const wav = require('wav');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const TOKEN_REGEX = /^Bot\s[a-zA-Z0-9_.-]+$/; // Regular expression pattern for token validation

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages];
const clients = {};

const vcRecord = async (req, res) => {
	const { authorization: token } = req.headers;

	const vcid = req.query.vcid;
	const recordingchannelid = req.query.recordingchannelid;
	const serverid = req.query.serverid;

	if (!vcid || !serverid || !recordingchannelid) {
		res.status(400).json({ error: 'Missing required parameters. Please ensure you are using all required parameters' });
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
		}

		const guild = await client.guilds.fetch(serverid);
		const channel = await guild.channels.fetch(vcid);
		const recordingChannel = await guild.channels.fetch(recordingchannelid);

		const existingConn = getVoiceConnection(channel.guild.id);
		if (existingConn) {
			res.status(400).json({ error: 'Already recording in another channel' });
			return;
		}

		if (!channel) {
			res.status(404).json({ error: 'Channel not found' });
			return;
		}

		if (channel.type !== ChannelType.GuildVoice) {
			res.status(400).json({ error: 'Not a voice channel' });
			return;
		}

		if (recordingChannel.type !== ChannelType.GuildText) {
			res.status(400).json({ error: 'Recording channel must be a text channel' });
			return;
		}

		//join voice channel
		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			selfDeaf: false,
			selfMute: false,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});

		await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
		if (connection.state.status !== VoiceConnectionStatus.Ready) {
			res.status(500).json({ error: 'Failed to join voice channel' });
			return;
		}
		/* 		const usersInChannel = channel.members.filter((member) => !member.user.bot).map((member) => member.user.id);
		for (const userId of usersInChannel) {
			console.log(`Subscribed to ${userId}`);
		} */
		const timestamp = new Date().getTime();
		const filename = `./recordings/${vcid}-${timestamp}`;
		const pcmFile = `${filename}.pcm`;
		const wavFile = `${filename}.wav`;
		const mp3File = `${filename}.mp3`;
		let stream;
		let decoder;
		let out;

		//detect when user joins voice channel //! not needed
		/* 		client.on('voiceStateUpdate', async (oldState, newState) => {
			if (newState.channelId === channel.id) {
				console.log(`User ${newState.member.user.tag} joined voice channel`);
				const userId = newState.member.id;
			}
		}); */

		connection.receiver.speaking.on('start', async (userId) => {
			if (connection.receiver.subscriptions.size === 0) {
				stream = connection.receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 100 } });
				out = fs.createWriteStream(pcmFile, { flags: 'a' });
				decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
				stream.pipe(decoder).pipe(out);
				//console.log(`User ${userId} started speaking`);
			}
		});

		client.on('voiceStateUpdate', async (oldState, newState) => {
			if (oldState.channelId === channel.id) {
				if (channel.members.size === 1) {
					console.log(`No users left in voice channel, disconnecting in 10 seconds`);
					setTimeout(() => {
						try {
							if (channel.members.size === 1) {
								connection.destroy();
								console.log(`Disconnected from voice channel`);
								out.close();
								const pcm = fs.createReadStream(pcmFile);
								const wavData = new wav.FileWriter(wavFile, {
									sampleRate: 48000,
									channels: 2,
									bitDepth: 16,
								});
								pcm.pipe(wavData);
								pcm.on('close', async () => {
									try {
										await exec(`ffmpeg -i ${wavFile} ${mp3File}`);
										await sendFile();
										setTimeout(() => {
											try {
												fs.unlinkSync(mp3File);
											} catch (error) {
												console.log(error);
											}
										}, 10000);
									} catch (error) {
										console.log(error);
									}
								});
							}
							async function sendFile() {
								fs.unlinkSync(pcmFile);
								fs.unlinkSync(wavFile);

								const attachment = new AttachmentBuilder(mp3File, { name: 'recording.mp3' });
								recordingChannel.send({
									files: [attachment],
								});
							}
						} catch (error) {
							console.log(error);
							connection.destroy();
						}
					}, 10000);
				}
			}
		});

		res.status(200).json({ message: 'Joined voice channel successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Something went wrong, your recording was not saved.' });
	}
};

module.exports = vcRecord;
