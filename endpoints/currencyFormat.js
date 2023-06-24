// formats the number into a currency format, eg: 1000 = 1,000
const currencyFormat = async (req, res) => {
    const { number } = req.body;
  
    // Check if the input is a valid number
    if (isNaN(number)) {
      return res.status(400).json({ error: 'Invalid number provided' });
    }
  
    // Convert the number to currency format
    const currencyFormat = Number(number).toLocaleString();
  
    res.json({ result: currencyFormat });
    console.log(currencyFormat);
  };

  module.exports = currencyFormat;