// Removes the last X characters from a string, where X is the number passed to count
const removeLast = async (req, res) => {
    const { string, count } = req.body;
    let charcount;
  
    const result = string.substring(0, string.length - count);
    charcount = result.length;
  
    res.json({ result, charcount });
    console.log(result);
  };

  module.exports = removeLast;