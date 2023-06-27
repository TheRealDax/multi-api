//gets the first X characters in a string, where X is the number passed to count
const getFirst = async (req, res) => {
    const { string, count } = req.body;
    let charcount;

    if (string == undefined || count == undefined){
      res.status(400).json({ error: 'string and count must be declared and have a value' });
      return;
    }
  
    const result = string.substring(0, count);
    charcount = result.length;
  
    res.json({ result, charcount });
    console.log(result);
  };

  module.exports = getFirst;