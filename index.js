const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const swaggerui = require('swagger-ui-express');
const specs = require('./config/swagger');
const db = require('./functions/db');


const PORT = process.env.PORT || 3000;
async function Init() {
	await db.connect();

	const app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

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
	const globalChat = require('./endpoints/globalChat');
	const automod = require('./endpoints/automod.js');
	const highestRole = require('./endpoints/highestRole');
	const vcRecord = require('./endpoints/vcrecord');
	const globalBan = require('./endpoints/globalban');
	const replace = require('./endpoints/replace');
	const base64 = require('./endpoints/base64');
	const upload = require('./endpoints/upload');

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
	app.post('/base64', base64);

	// GET requests
	app.get('/temprole', tempRole);
	app.get('/getrolecount', getRoleCount);
	app.get('/convertnum', convertNum);
	app.get('/currencyformat', currencyFormat);
	app.get('/random', random);
	app.get('/memberroles', memberRoles);
	app.get('/globalchat', globalChat);
	app.get('/highestrole', highestRole);
	app.get('/vcrecord', vcRecord);
	app.get('/globalban', globalBan);
	app.get('/upload', upload);

	//Event listeners

	// Use requests
	app.use('/docs', swaggerui.serve, swaggerui.setup(specs));

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}
Init().catch(console.error);


	//! Disabled code
	//const getThreads = require('./endpoints/getThreads');
	//const daStripe = require('./routes/DA_stripe');
	//app.post('/dastripe', daStripe);
	//app.get('/getthread', getThreads);
	//const authRoutes = require('./routes/auth-routes');
	//require('./config/passport');
	//app.use(passport.initialize());