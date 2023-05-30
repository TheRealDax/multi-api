const express = require('express');
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
  const { string, start, end } = req.body;
  let result;
  
  if (end !== undefined) {
    result = string.substring(start, end);
  } else {
    result = string.substring(start);
  }
  
  res.json({ result });
});

//converts a time and date string into unix formatted timestamp
app.post('/timestamp', (req, res) => {
  const { time, date } = req.body;
  const dateTimeString = `${date} ${time}`;
  const parsedDateTime = moment(dateTimeString, ['DD/MM/YYYY h:mmA', 'DD/MM/YYYY HH:mm']);
  
  if (parsedDateTime.isValid()) {
    const result = parsedDateTime.unix();
    res.json({ result });
  } else {
    res.status(400).json({ error: 'Invalid input' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
