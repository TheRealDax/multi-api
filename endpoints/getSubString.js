/**
 * @swagger
 * /getsubstring:
 *   post:
 *     summary: Get a substring from a string based on start and end indices
 *     tags: [String Manipulation]
 *     description: Retrieves a substring from a given string based on the start and end indices. Optionally, it can return only numeric characters.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - string
 *               - start
 *             properties:
 *               string:
 *                 type: string
 *                 description: The input string
 *                 example: Hello, world!
 *               start:
 *                 type: integer
 *                 description: The starting index of the substring
 *                 example: 7
 *               end:
 *                 type: integer
 *                 description: The ending index of the substring (optional)
 *                 example: 12
 *               numonly:
 *                 type: boolean
 *                 description: Flag to return only numeric characters (optional)
 *                 example: false
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
 *                   description: The resulting substring
 *                 charcount:
 *                   type: integer
 *                   description: The number of characters in the resulting substring
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Error in request
 */

//gets the specified characters in a string from a start point and end point using start, end
const getSubString = async (req, res) => {
    try {
    let { string, start, end, numonly } = req.body;
    let result;
    let charcount;

    if (string == undefined){
      res.status(400).json({ error: 'no string detected' });
      return;
    }

    if (!start || start == undefined){
      start = 0;
    }

    if (typeof string !== 'string'){
      string = string.toString();
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

  } catch(err){
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }};

  module.exports = getSubString;