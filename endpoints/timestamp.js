const moment = require('moment');

//generate a unix timestamp based on a specific date and time or days in the future
const timestamp = async (req, res) => {
    const { date, time, days, format, timestamp, offset} = req.body;
  
    let convertedTimestamp;
  
    if (date && time) {
      const datetime = `${date} ${time}`;
      const dateFormat = getDateFormat(format);
      convertedTimestamp = moment(datetime, dateFormat).unix();

    } else if (days) {
      const futureDate = moment().add(days, 'days');
      convertedTimestamp = futureDate.unix();

    } else if (!date && !time && timestamp) {
      if (offset) {
        const offsetTimestamp = moment(timestamp).add(offset, 'hours');
        convertedTimestamp = offsetTimestamp.format('DD-MM-YYYY HH:mm:ss');
      } else {
        convertedTimestamp = moment(timestamp).format('DD-MM-YYYY HH:mm:ss');
      }

    } else {
      return res.status(400).json({ error: 'Invalid request. Please provide either date and time or days parameter.' });
    }
  
    res.json({ convertedTimestamp });
  };

  //funtion to decide the date/time format. Default is EU if format parameter is not passed.
function getDateFormat(format) {
    switch (format) {
      case 'US':
        return ['MM/DD/YYYY h:mmA', 'MM/DD/YYYY HH:mm'];
      case 'EU':
        return ['DD/MM/YYYY h:mmA', 'DD/MM/YYYY HH:mm'];
      case 'ISO':
        return ['YYYY-MM-DD HH:mm:ss'];
      default:
        return ['DD/MM/YYYY h:mmA', 'DD/MM/YYYY HH:mm'];
    }
  }

  module.exports = timestamp;