const express = require('express');
const moment = require('moment');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//gets the first X characters in a string, where X is the number passed to count
app.post('/getfirst', (req, res) => {
  const { string, count } = req.body;
  let charcount;

  const result = string.substring(0, count);
  charcount = result.length;

  res.json({ result, charcount });
});

//gets the last X characters in a string, where X is the number passed to count
app.post('/getlast', (req, res) => {
  const { string, count } = req.body;
  let charcount;

  const result = string.substring(string.length - count);
  charcount = result.length;

  res.json({ result, charcount });
});

// Removes the last X characters from a string, where X is the number passed to count
app.post('/removelast', (req, res) => {
  const { string, count } = req.body;
  let charcount;

  const result = string.substring(0, string.length - count);
  charcount = result.length;

  res.json({ result, charcount });
});

//gets the specified characters in a string from a start point and end point using start, end
app.post('/getsubstring', (req, res) => {
  const { string, start, end, numonly } = req.body;
  let result;
  let charcount;

  if (end !== undefined) {
    result = string.substring(start, end);
  } else {
    result = string.substring(start);
  }

  result = result.trim();
  
  if (numonly === 'yes') {
    result = result.replace(/[\D#&]/g, '');
  }

  charcount = result.length;

  res.json({ result, charcount });
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

// formats the number into a currency format, eg: 1000 = 1,000
app.post('/currencyformat', (req, res) => {
  const { number } = req.body;

  // Check if the input is a valid number
  if (isNaN(number)) {
    return res.status(400).json({ error: 'Invalid number provided' });
  }

  // Convert the number to currency format
  const currencyFormat = Number(number).toLocaleString();

  res.json({ result: currencyFormat });
});

//converts numbers from full to short or vice versa, eg: 1000 = 1k OR 1k = 1000
app.post('/convertnum', (req, res) => {
  const { number } = req.body;

  // Conversion from number to shortened format
  if (!isNaN(number)) {
    const num = parseFloat(number);
    let result = number;

    if (num >= 1000000000000) {
      if (num % 1 === 0) {
        result = (num / 1000000000000) + 't';
      } else {
        result = (num / 1000000000000).toFixed(2) + 't';
      }
    } else if (num >= 1000000000) {
      if (num % 1 === 0) {
        result = (num / 1000000000) + 'b';
      } else {
        result = (num / 1000000000).toFixed(2) + 'b';
      }
    } else if (num >= 1000000) {
      if (num % 1 === 0) {
        result = (num / 1000000) + 'm';
      } else {
        result = (num / 1000000).toFixed(2) + 'm';
      }
    } else if (num >= 1000) {
      if (num % 1 === 0) {
        result = (num / 1000) + 'k';
      } else {
        result = (num / 1000).toFixed(2) + 'k';
      }
    }

    res.json({ result });
  }
  
  // Conversion from shortened format to number
  else {
    const numStr = number.toLowerCase();
    let result = number;

    if (numStr.endsWith('t')) {
      result = parseFloat(numStr) * 1000000000000;
    } else if (numStr.endsWith('b')) {
      result = parseFloat(numStr) * 1000000000;
    } else if (numStr.endsWith('m')) {
      result = parseFloat(numStr) * 1000000;
    } else if (numStr.endsWith('k')) {
      result = parseFloat(numStr) * 1000;
    }

    res.json({ result });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
