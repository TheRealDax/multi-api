/**
 * @swagger
 * /vcRecord:
 *   get:
 *     summary: Record audio in a voice channel and send it as an MP3 file.
 *     description: This endpoint allows recording audio in a voice channel and sending it as an MP3 file to a designated text channel.
 *     tags: [Discord]
 *     parameters:
 *       - in: query
 *         name: vcid
 *         schema:
 *           type: string
 *         description: The ID of the voice channel where audio will be recorded.
 *         required: true
 *       - in: query
 *         name: recordingchannelid
 *         schema:
 *           type: string
 *         description: The ID of the text channel where the recorded audio will be sent as an MP3 file.
 *         required: true
 *       - in: query
 *         name: serverid
 *         schema:
 *           type: string
 *         description: The ID of the server where the voice channel and text channel are located.
 *         required: true
 *       - in: query
 *         name: recordingname
 *         schema:
 *           type: string
 *         description: (Optional) The name of the recorded audio file (default is 'recording').
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authorization:
 *                 type: string
 *                 description: The Discord bot token in the format 'Bot <token>'.
 *             required:
 *               - authorization
 *     responses:
 *       200:
 *         description: Audio recording and sending as MP3 file were successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating that the recording was successful.
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A description of the error.
 *       404:
 *         description: Voice or text channel not found or invalid token format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A description of the error.
 *       500:
 *         description: An error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A description of the error.
 */


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

const vcRecord = async (req, res) => {
	const { authorization: token } = req.headers;

	const vcid = req.query.vcid;
	const recordingchannelid = req.query.recordingchannelid;
	const serverid = req.query.serverid;
	const recordingname = req.query.recordingname || 'recording';

	if (!vcid || !serverid || !recordingchannelid) {
		res.status(400).json({ error: 'Missing required parameters. Please ensure you are using all required parameters' });
		return;
	}

	if (!TOKEN_REGEX.test(token)) {
		res.status(400).json({ error: 'Invalid token format. Please provide a valid Discord bot token.' });
		return;
	}

	try {
		const client = new Client({ intents });
		await client.login(token);

		const guild = await client.guilds.fetch(serverid);
		const channel = await guild.channels.fetch(vcid);
		const recordingChannel = await guild.channels.fetch(recordingchannelid);

		const existingConn = getVoiceConnection(channel.guild.id);
		if (existingConn) {
			if (existingConn.state.status === VoiceConnectionStatus.Ready) {
				res.status(400).json({ error: 'Already recording in another channel' });
				return;
			}
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

		await entersState(connection, VoiceConnectionStatus.Ready, 10000);
		if (connection.state.status !== 'ready') {
			connection.disconnect();
			res.status(500).json({ error: 'Failed to join voice channel. Please try again' });
			return;
		}
		/* 		const usersInChannel = channel.members.filter((member) => !member.user.bot).map((member) => member.user.id);
		for (const userId of usersInChannel) {
			console.log(`Subscribed to ${userId}`);
		} */
		const timestamp = new Date().getTime();
		const tmpDir = '/tmp';
		const filename = `${tmpDir}/${vcid}-${timestamp}`;
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
					setTimeout(() => {
						try {
							if (channel.members.size === 1) {
								//check if pcmFile exists
								if (!fs.existsSync(pcmFile)) {
									connection.disconnect();
									return;
								}
								connection.disconnect();
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
								try {
									fs.unlinkSync(pcmFile);
									fs.unlinkSync(wavFile);

									const stats = fs.statSync(mp3File);
									const fileSizeInBytes = stats.size;
									const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
									const premium = guild.premiumTier;

									let premiumLimit;
									if (premium === 'NONE' || 'TIER_1') {
										premiumLimit = 25;
									} else if (premium === 'TIER_2') {
										premiumLimit = 50;
									} else if (premium === 'TIER_3') {
										premiumLimit = 100;
									}

									if (fileSizeInMegabytes > premiumLimit) {
										await recordingChannel.send(`Your recording could not be sent. Your server has a file upload limit of ${premiumLimit}MB and your recording is ${fileSizeInMegabytes.toFixed(2)}MB.`);
										client.destroy();
									} else {
										const attachment = new AttachmentBuilder(mp3File, { name: `${recordingname}.mp3` });
										await recordingChannel.send({
											files: [attachment],
										});
										client.destroy();
									}
								} catch (error) {
									client.destroy();
									console.log(error);
								}
							}
						} catch (error) {
							client.destroy();
							console.log(error);
						}
					}, 10000);
				}
			}
		});
		res.status(200).json({ message: 'Joined voice channel successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Something went wrong, your recording was not saved.' });
	}
};

module.exports = vcRecord;
