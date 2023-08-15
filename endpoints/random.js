/**
 * @swagger
 * /random:
 *   get:
 *     summary: Generate a random string
 *     tags: [String Manipulation]
 *     description: Generates a random string based on the provided parameters.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: length
 *         in: query
 *         description: The length of the random string to generate
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *       - name: lettercase
 *         in: query
 *         description: The letter case for the random string (lower, upper, mix)
 *         schema:
 *           type: string
 *           enum: [lower, upper, mix]
 *           default: lower
 *       - name: numbers
 *         in: query
 *         description: Flag to include numbers in the random string
 *         schema:
 *           type: boolean
 *           default: true
 *       - name: charlimit
 *         in: query
 *         description: The character limit to use for generating the random string
 *         schema:
 *           type: string
 *           example: "abcdefghijklmnopqrstuvwxyz0123456789"
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
 *                   description: The generated random string
 *       400:
 *         description: Invalid or missing parameters
 */

const random = async (req, res) => {
    try{
    const length = parseInt(req.query.length) || 8;
    const lettercase = req.query.lettercase || 'lower';
    const numbers = req.query.numbers !== 'false';
    const charlimit = req.query.charlimit || 'abcdefghijklmnopqrstuvwxyz0123456789';

    if (isNaN(length) || length <= 0) {
        res.status(400).send({ error: 'Please use a length parameter of 1 or more.' });
        return;
    }

    let characters = '';
    if (lettercase === 'lower' || lettercase === 'mix') {
        characters += charlimit.toLowerCase();
    }
    if (lettercase === 'upper' || lettercase === 'mix') {
        characters += charlimit.toUpperCase();
    }
    if (!numbers) {
        characters = characters.replace(/[0-9]/g, '');
    }

    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return res.status(200).json({ result });
    console.log(result);

} catch(err){
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}};

module.exports = random;