//converts numbers from full to short or vice versa, eg: 1000 = 1k OR 1k = 1000
const convertNum = async (req, res) => {
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
      console.log(result);
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
      console.log(result);
    }
  };

  module.exports = convertNum;