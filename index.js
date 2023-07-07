const dotenv = require('dotenv');
const express = require('express');
const swaggerui = require('swagger-ui-express');
const specs = require('./docs/swagger')

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/doc', swaggerui.serve, swaggerui.setup(specs));

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


// POST requests
app.post('/regex', regex);
app.post('/getfirst', getFirst);
app.post('/getlast', getLast);
app.post('/removelast', removeLast);
app.post('/getsubstring', getSubString);
app.post('/timestamp', timestamp);
app.post('/transcript', transcript);
app.post('/vc', vc);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});