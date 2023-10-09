/**
 * @swagger
 * /getlast:
 *   post:
 *     summary: Get the last n characters from a string
 *     tags: [String Manipulation]
 *     description: Retrieves the last n characters from a given string where n is the value passed to count.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               string:
 *                 type: string
 *                 description: The input string
 *                 example: Hello, world!
 *               count:
 *                 type: integer
 *                 description: The number of characters to retrieve
 *                 example: 6
 *     responses:
 *       200:
 *         description: Successful request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: The last n characters from the string
 *                 charcount:
 *                   type: integer
 *                   description: The number of characters retrieved
 *       400:
 *         description: Missing or invalid parameters
 */

//gets the last X characters in a string, where X is the number passed to count
const getLast = async (req, res) => {
  try {
    let { string, count } = req.body;
    let charcount;

    if (string == undefined || count == undefined){
      res.status(400).json({ error: 'string and count must be declared and have a value' });
      return;
    }

    if (typeof string !== 'string'){
      string = string.toString();
    }
  
    const result = string.substring(string.length - count);
    charcount = result.length;
  
    return res.json({ result, charcount });

  } catch(err){
    console.error('Error:', err);
    return res.status(500).json({ error: `${err}` });
  }};

  module.exports = getLast;