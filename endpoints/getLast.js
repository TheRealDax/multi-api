//gets the last X characters in a string, where X is the number passed to count
const getLast = async (req, res) => {
    const { string, count } = req.body;
    let charcount;
  
    const result = string.substring(string.length - count);
    charcount = result.length;
  
    res.json({ result, charcount });
  };

  module.exports = getLast;