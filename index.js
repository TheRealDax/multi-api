const express = require('express');
const moment = require('moment');
const AWS = require('aws-sdk');
const app = express();

AWS.config.update({ region: process.env.BUCKETEER_AWS_REGION });
const S3 = new AWS.S3();

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

// Endpoint to add content to transcripts
app.post('/transcript', async (req, res) => {
  const { serverid, channelid, content, close } = req.body;

  const bucketName = process.env.BUCKETEER_BUCKET_NAME;
  const s3Key = `transcripts/${serverid}-${channelid}.html`;

  try {
    // Retrieve the existing transcript file from S3 or create a new one if it doesn't exist
    const existingObject = await S3.getObject({ Bucket: bucketName, Key: s3Key }).promise();
    const existingContent = existingObject.Body.toString();

    // Update the content
    const updatedContent = existingContent + content;

    // Upload the updated content to S3
    await S3.putObject({ Bucket: bucketName, Key: s3Key, Body: updatedContent }).promise();

    if (close) {
      res.json({ message: 'Transcript closed and updated on S3.' });
    } else {
      res.json({ message: 'Transcript updated on S3.' });
    }
  } catch (error) {
    // Create a new transcript file if it doesn't exist
    if (error.code === 'NoSuchKey') {
      await S3.putObject({ Bucket: bucketName, Key: s3Key, Body: content }).promise();
      res.json({ message: 'Transcript created on S3.' });
    } else {
      console.error(`Error updating transcript on S3: ${error}`);
      res.status(500).json({ error: 'Failed to update transcript on S3.' });
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
