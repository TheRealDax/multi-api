//gets the specified characters in a string from a start point and end point using start, end
const getSubString = async (req, res) => {
    const { string, start, end, numonly } = req.body;
    let result;
    let charcount;
  
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
  };

  module.exports = getSubString;