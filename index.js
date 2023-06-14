const dotenv = require("dotenv");
const express = require('express');
const moment = require('moment');


const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const app = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const s3Client = new S3Client({ region: process.env.AWS_REGION });

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

  if (numonly) {
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
  const { serverid, channelid, content, close, channelname, user, usericon } = req.body;
  const bucketName = process.env.BUCKET_NAME;
  const s3Key = `transcripts/${serverid}-${channelid}.html`;
  const timeNow = new Date();

  try {
    // Retrieve the existing transcript file from S3 or create a new one if it doesn't exist
    const getObjectCommand = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
    const existingObject = await s3Client.send(getObjectCommand);

    // Stream and collect the existing content
    const chunks = [];
    existingObject.Body.on('data', (chunk) => {
      chunks.push(chunk);
    });

    existingObject.Body.on('end', async () => {
      const existingContent = Buffer.concat(chunks).toString();

    // Combine the existing content and new content
    const updatedContent = `${existingContent}<div class='msg'>
    <div class='left'><img
        src='${usericon}'>
    </div>
    <div class='right'>
        <div><a>${user}</a><a>${timeNow}</a></div>
        <p>${content}</p>
    </div>
</div>`;

    // Upload the updated content to S3
    if (content && !close) {
    const putObjectCommand = new PutObjectCommand({ Bucket: bucketName, Key: s3Key, Body: updatedContent, ContentType: 'text/html' });
    await s3Client.send(putObjectCommand);
    }

    if (close) {
      const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      res.json({ message: 'Transcript closed and updated.', url });
    } else {
      res.json({ message: 'Transcript updated.' });
    }
  });

  } catch (error) {
    // Create a new transcript file if it doesn't exist
    if (error.name === 'NoSuchKey') {
      const fileContent = `<ticket-info>
      Ticket Creator | ${user}
      Ticket Name    | ${channelname}
      Created        | ${timeNow}
  </ticket-info>
          <!DOCTYPE html><html><head><style>@import url(https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&display=swap);ticket-info{display:none}body{background-color:#181d23;color:#fff;font-family:Rajdhani,sans-serif;margin:50px}.header h2{font-weight:400;text-transform:capitalize;margin-bottom:0;color:#fff}.header p{font-size:14px}.header .header-container .header-item{margin-right:25px;display:flex;align-items:center}.header .header-container{display:flex}.header .header-container .header-item a{margin-right:7px;padding:6px 10px 5px;background-color:#f45142;border-radius:3px;font-size:12px}.messages{margin-top:30px;display:flex;flex-direction:column}.messages .msg{display:flex;margin-bottom:31px}.messages .msg .left img{border-radius:100%;height:50px}.messages .msg .left{margin-right:20px}.messages .msg .right a:first-child{font-weight:400;margin:0 15px 0 0;font-size:19px;color:#fff}.messages .msg .right a:nth-child(2){text-transform:capitalize;color:#fff;font-size:12px}.messages .msg .right div{display:flex;align-items:center;margin-top:5px}.messages .msg .right p{margin:10px 0 0;white-space:normal;line-height:2;color:#fff;font-size:15px;max-width:700px}@media only screen and (max-width:600px){body{margin:0;padding:25px;width:calc(100% - 50px)}.ticket-header h2{margin-top:0}.ticket-header .children{display:flex;flex-wrap:wrap}}</style><title>Transcript | ticket-225647195771240448</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet"></head><body><div class='header'>
              <h2>Transcript for <b>${channelname}</b></h2>
              <div class='header-container'>
                  <div class='header-item'><a>Created: </a><p>${timeNow}</p></div>
                  <div class='header-item'><a>User: </a><p>${user}</p></div>
              </div>
          </div><div class='messages'><div class='msg'>
                  <div class='left'><img
                      src='${usericon}'>
                  </div>
                  <div class='right'>
                      <div><a>${user}</a><a>${timeNow}</a></div>
                      <p>${content}</p>
                  </div>
              </div>`;

      const putObjectCommand = new PutObjectCommand({ Bucket: bucketName, Key: s3Key, Body: fileContent, ContentType: 'text/html' });
      await s3Client.send(putObjectCommand);
      res.json({ message: 'Transcript created.' });
    } else {
      console.error(`Error updating transcript: ${error.message}`);
      res.status(500).json({ error: 'Failed to update transcript.' });
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});

