//gets the first X characters in a string, where X is the number passed to count
const getFirst = async (req, res) => {
    const { string, count } = req.body;
    let charcount;
  
    const result = string.substring(0, count);
    charcount = result.length;
  
    res.json({ result, charcount });
  };

  module.exports = getFirst;