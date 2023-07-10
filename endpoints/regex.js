/**
 * @swagger
 * /regex:
 *   post:
 *     summary: Return matched string groups based on a regular expression
 *     tags: [String Manipulation]
 *     description: Returns matched string groups based on a provided regular expression.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               string:
 *                 type: string
 *                 description: The input string to match against
 *                 example: Hello, world!
 *               regex:
 *                 type: string
 *                 description: The regular expression pattern
 *                 example: "[A-Za-z]+"
 *     responses:
 *       200:
 *         description: Successful request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 responses:
 *                   type: object
 *                   description: The matched string groups
 *                 responses:
 *                   type: object
 *                   description: true
 *       400:
 *         description: Missing or invalid parameters
 *       404:
 *         description: No match found. Visit https://regex101.com/ for testing the regular expression.
 */

// Returns a string based on a regular expression
const regex = async (req, res) => {
  try {
    const string = req.body.string;
    const regex = req.body.regex;

    if (string == undefined || regex == undefined){
      res.status(400).json({ error: 'string and regex must be declared and have a value' });
      return;
    }

    const regexString = new RegExp(regex);
    const matchedString = regexString.exec(string);
  
    if (matchedString) {
      const matchedGroups = matchedString.slice(0);
      const responses = matchedGroups.reduce((result, group, index) => {
        result[`match${index + 1}`] = group;
        return result;
      }, {});
  
      res.json({ result: responses, match: true });
      console.log( responses );
    } else {
      res.status(404).json({ result: 'No match found. If you are having trouble, visit https://regex101.com/ to test your regular expression before trying again.', match: false });
    }
  } catch(err){
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }};

  module.exports = regex;