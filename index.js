const dotenv = require('dotenv');
const express = require('express');
const swaggerui = require('swagger-ui-express');
const specs = require('./docs/swagger');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

const store = new MongoDBStore({
    uri: process.env.MONGO_CONNECTION_STRING,
    collection: 'sessions'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: process.env.SESSION_SECRET, // Replace 'some secret value' with your actual secret
	resave: false,
	saveUninitialized: false,
	store: store,
	cookie: {
	  secure: true, // set to true if you are using https
	  maxAge: 24 * 60 * 60 * 1000 // 1 day
	}
  }));

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
const vc = require('./endpoints/vc');
const getRoleCount = require('./endpoints/getRoleCount');
const tempRole = require('./endpoints/tempRole');
const random = require('./endpoints/random');
const memberRoles = require('./endpoints/memberRoles');
const globalChat = require('./endpoints/globalChat');
const genTally = require('./Genbot/genTally');
const gmailToDiscord = require('./events/gmailToDiscord');
const sendEmails = require('./Genbot/sendEmails');
const automod = require('./endpoints/automod');

// POST requests
app.post('/regex', regex);
app.post('/getfirst', getFirst);
app.post('/getlast', getLast);
app.post('/removelast', removeLast);
app.post('/getsubstring', getSubString);
app.post('/timestamp', timestamp);
app.post('/transcript', transcript);
app.post('/vc', vc);
app.post('/sendemail', sendEmails);
app.post('/automod', automod);

// GET requests
app.get('/temprole', tempRole);
app.get('/getrolecount', getRoleCount);
app.get('/convertnum', convertNum);
app.get('/currencyformat', currencyFormat);
app.get('/random', random);
app.get('/memberroles', memberRoles);
app.get('/globalchat', globalChat);

// Event listeners
app.post('/gentally', genTally);

// Use requests
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(gmailToDiscord);
app.use('/docs', swaggerui.serve, swaggerui.setup(specs));

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
