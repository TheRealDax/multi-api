/**
 * @swagger
 * /currencyformat:
 *   get:
 *     summary: Convert number to currency format
 *     tags: [Number Manipulation]
 *     description: Accepts a number and converts it to a currency format. For example, 1000 would be converted to 1,000.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: number
 *         description: The number to convert to currency format
 *         in: query
 *         required: true
 *         type: integer
 *         example: 1000
 *     responses:
 *       200:
 *         description: Successful request
 *         schema:
 *           type: object
 *           properties:
 *             result:
 *               type: string
 *               example: "1,000"
 *       400:
 *         description: Invalid number provided
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               example: "Invalid number provided"
 */

// formats the number into a currency format, eg: 1000 = 1,000
const currencyFormat = async (req, res) => {
  try {
    const { number } = req.query;
  
    // Check if the input is a valid number
    if (isNaN(number)) {
      return res.status(400).json({ error: 'Invalid number provided' });
    }
  
    // Convert the number to currency format
    const currencyFormat = Number(number).toLocaleString();
  
    res.status(200).json({ result: currencyFormat });

  } catch(err){
    console.error('Error:', err);
    return res.status(500).json({ error: `${err}` });
  }};

  module.exports = currencyFormat;