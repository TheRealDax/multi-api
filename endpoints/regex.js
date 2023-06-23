// Returns a string based on a regular expression
const regex = async (req, res) => {
    const string = req.body.string;
    const regex = req.body.regex;
  
    const regexString = new RegExp(regex);
    const matchedString = regexString.exec(string);
  
    if (matchedString) {
      const matchedGroups = matchedString.slice(0);
      const responses = matchedGroups.reduce((result, group, index) => {
        result[`match${index + 1}`] = group;
        return result;
      }, {});
  
      res.json({ result });
      console.log(result);
    } else {
      res.status(500).json({ error: 'No match found. If you are having trouble, visit https://regex101.com/ to test your regular expression before trying again.' });
    }
  };

  module.exports = regex;