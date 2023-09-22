const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const swaggerui = require('swagger-ui-express');
const path = require('path');
const passport = require('passport');
const specs = require('./config/swagger');
const db = require('./functions/db');


const PORT = process.env.PORT || 3000;
async function Init() {
	await db.connect();

	const authRoutes = require('./routes/auth-routes');
	require('./config/passport');

	const app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.use(passport.initialize());

	// Endpoints
	const getFirst = require('./endpoints/getFirst');
	const getLast = require('./endpoints/getLast');
	const removeLast = require('./endpoints/removeLast');
	const getSubString = require('./endpoints/getSubString');
	const timestamp = require('./endpoints/timestamp');
	const currencyFormat = require('./endpoints/currencyFormat');
	const convertNum = require('./endpoints/convertNum');
	const transcript = require('./endpoints/transcript');
	const regex = require('./endpoints/regex');
	const getRoleCount = require('./endpoints/getRoleCount');
	const tempRole = require('./endpoints/tempRole');
	const random = require('./endpoints/random');
	const memberRoles = require('./endpoints/memberRoles');
	const genTally = require('./Genbot/genTally');
	const globalChat = require('./endpoints/globalChat');
	const automod = require('./endpoints/automod');
	const getEmails = require('./functions/getEmails');
	const sendEmails = require('./Genbot/sendEmail');
	const highestRole = require('./endpoints/highestRole');
	const getThreads = require('./endpoints/getThreads');
	const daStripe = require('./routes/DA_stripe');
	const vcRecord = require('./endpoints/vcrecord');
	const globalBan = require('./endpoints/globalban');
	const purge = require('./endpoints/purge');
	const checkNum = require('./endpoints/checknum');
	const replace = require('./endpoints/replace');

	// POST requests
	app.post('/regex', regex);
	app.post('/getfirst', getFirst);
	app.post('/getlast', getLast);
	app.post('/removelast', removeLast);
	app.post('/getsubstring', getSubString);
	app.post('/timestamp', timestamp);
	app.post('/transcript', transcript);
	app.post('/automod', automod);
	app.post('/replace', replace);

	// GET requests
	app.get('/temprole', tempRole);
	app.get('/getrolecount', getRoleCount);
	app.get('/convertnum', convertNum);
	app.get('/currencyformat', currencyFormat);
	app.get('/random', random);
	app.get('/memberroles', memberRoles);
	app.get('/globalchat', globalChat);
	app.get('/highestrole', highestRole);
	app.get('/getthread', getThreads);
	app.get('/vcrecord', vcRecord);
	app.get('/globalban', globalBan);
	app.get('/purge', purge);
	app.get('/checknum', checkNum);

	//Event listeners
	app.post('/gentally', genTally);
	app.post('/dastripe', daStripe);

	//Google auth routes
	app.use('/auth', authRoutes);
	app.get('/getmails', getEmails);
	app.post('/sendmail', sendEmails);

	// Use requests
	app.use('/public', express.static(path.join(__dirname, 'public')));
	app.use('/docs', swaggerui.serve, swaggerui.setup(specs));

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}
Init().catch(console.error);
