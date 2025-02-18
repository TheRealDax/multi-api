/**
 * @swagger
 * /removelast:
 *   post:
 *     summary: Remove the last n characters from a string
 *     tags: [String Manipulation]
 *     description: Removes the last n characters from a given string, where n is the number passed to `count`.
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
 *                 description: The input string
 *                 example: Hello, world!
 *               count:
 *                 type: integer
 *                 description: The number of characters to remove from the end of the string
 *                 example: 7
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
 *                   description: The resulting string after removing the last n characters
 *                 charcount:
 *                   type: integer
 *                   description: The number of characters in the resulting string
 *       400:
 *         description: Missing or invalid parameters
 */


// Removes the last n characters from a given string, where n is the number passed to `count`.
const removeLast = async (req, res) => {
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
  
    const result = string.substring(0, string.length - count);
    charcount = result.length;
  
    return res.json({ result, charcount });

  } catch(err){
    return res.status(500).json({ error: `${err}` });
  }};

  module.exports = removeLast;