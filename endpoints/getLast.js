/**
 * @swagger
 * /api/getLast:
 *   get:
 *     summary: Get the last n characters from a string
 *     tags: [String Manipulation]
 *     description: |
 *       Retrieves the last n characters from a given string where n is the value passed to count.
 *     parameters:
 *       - in: query
 *         name: string
 *         description: The input string.
 *         example: Hello, world!
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: count
 *         description: The number of characters to retrieve
 *         example: 6
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: The last characters of the input string.
 *                 charcount:
 *                   type: integer
 *                   description: The number of characters in the result.
 *       '400':
 *         description: Bad request. The `string` and `count` parameters must be declared and have a value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
//gets the last X characters in a string, where X is the number passed to count
const getLast = async (req, res) => {
  try {
    let { string, count } = req.query;
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