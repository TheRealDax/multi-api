//gets the specified characters in a string from a start point and end point using start, end
const getSubString = async (req, res) => {
    const { string, start, end, numonly } = req.body;
    let result;
    let charcount;

    if (string == undefined || start == undefined){
      res.status(400).json({ error: 'string and start must be declared and have a value' });
      return;
    }
  
    if (end !== undefined) {
      result = string.substring(start, end);
    } else {
      result = string.substring(start);
    }
  
    result = result.trim();
  
    if (numonly) {
      result = result.replace(/[\D#&]/g, '');
    }
  
    charcount = result.length;
  
    res.json({ result, charcount });
    console.log(result);
  };

  module.exports = getSubString;