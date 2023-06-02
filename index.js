const express = require('express');
const moment = require('moment');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//gets the first X characters in a string, where X is the number passed to count
app.post('/getfirst', (req, res) => {
  const { string, count } = req.body;
  const result = string.substring(0, count);
  res.json({ result });
});

//gets the last X characters in a string, where X is the number passed to count
app.post('/getlast', (req, res) => {
  const { string, count } = req.body;
  const result = string.substring(string.length - count);
  res.json({ result });
});

// Removes the last X characters from a string, where X is the number passed to count
app.post('/removelast', (req, res) => {
  const { string, count } = req.body;
  const result = string.substring(0, string.length - count);
  res.json({ result });
});

//gets the specified characters in a string from a start point and end point using start, end
app.post('/getsubstring', (req, res) => {
  const { string, start, end, numonly } = req.body;
  let result;

  if (end !== undefined) {
    result = string.substring(start, end);
  } else {
    result = string.substring(start);
  }

  if (numonly === 'yes') {
    result = result.replace(/[\D#&]/g, '');
  }

  res.json({ result });
});

//generate a unix timestamp based on a specific date and time or days in the future
app.post('/timestamp', (req, res) => {
  const { date, time, days, format } = req.body;

  let timestamp;

  if (date && time) {
    const datetime = `${date} ${time}`;
    const dateFormat = getDateFormat(format);
    timestamp = moment(datetime, dateFormat).unix();
  } else if (days) {
    const futureDate = moment().add(days, 'days');
    timestamp = futureDate.unix();
  } else {
    return res.status(400).json({ error: 'Invalid request. Please provide either date and time or days parameter.' });
  }

  res.json({ timestamp });
});

//funtion to decide the date/time format. Default is EU if format parameter is not passed.
function getDateFormat(format) {
  switch (format) {
    case 'US':
      return ['MM/DD/YYYY h:mmA', 'MM/DD/YYYY HH:mm'];
    case 'EU':
    default:
      return ['DD/MM/YYYY h:mmA', 'DD/MM/YYYY HH:mm'];
  }
  
}
app.post('/currencyformat', (req, res) => {
  const { number } = req.body;

  // Check if the input is a valid number
  if (isNaN(number)) {
    return res.status(400).json({ error: 'Invalid number provided. Please provide a valid number.' });
  }

  // Convert the number to currency format
  const currencyFormat = Number(number).toLocaleString();

  res.json({ result: currencyFormat });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
