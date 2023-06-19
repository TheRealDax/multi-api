const moment = require('moment');

//generate a unix timestamp based on a specific date and time or days in the future
const timestamp = async (req, res) => {
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
  };

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

  module.exports = timestamp;