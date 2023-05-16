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

//gets the specified characters in a string from a start point and end point using start, end
app.post('/getsubstring', (req, res) => {
    const { string, start, end } = req.body;
    const result = string.substring(start, end);
    res.json({ result });
  });

app.listen(443, () => {
  console.log('Server is running on port 3000');
});
