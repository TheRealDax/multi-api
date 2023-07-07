/**
 * @swagger
 * /getfirst:
 *   post:
 *     summary: Get the first n characters from a string
 *     tags: [String Manipulation]
 *     description: Retrieves the first n characters from a given string where n is the value passed to count.
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
 *                 example: 5
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
 *                   description: The first n characters from the string
 *                 charcount:
 *                   type: integer
 *                   description: The number of characters retrieved
 *       400:
 *         description: Missing or invalid parameters
 */

//gets the first X characters in a string, where X is the number passed to count
const getFirst = async (req, res) => {
    const { string, count } = req.body;
    let charcount;

    if ( string == undefined || count == undefined || isNaN(count) ){
      res.status(400).json({ error: 'string and count must be declared and have a valid value' });
      return;
    }
  
    const result = string.substring(0, count);
    charcount = result.length;
  
    res.json({ result, charcount });
    console.log(result);
  };

  module.exports = getFirst;