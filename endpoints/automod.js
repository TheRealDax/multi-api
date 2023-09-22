/**
 * @swagger
 * /automod:
 *   post:
 *     summary: Check for matching words in a message.
 *     description: This endpoint checks if any of the specified words in the request body match words in the message.
 *     tags: [Discord]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to check for matching words.
 *               words:
 *                 type: string
 *                 description: The words to check for in the message, separated by spaces. You need to use {printAllValues[{BGVAR_word_list}],[$value ]} in order for this to work.
 *             required:
 *               - message
 *               - words
 *     responses:
 *       200:
 *         description: A match was found in the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 match:
 *                   type: boolean
 *                   description: Indicates if a match was found (true).
 *                 matchedWord:
 *                   type: string
 *                   description: The matched word(s) from the message.
 *       404:
 *         description: No match was found in the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 match:
 *                   type: boolean
 *                   description: Indicates if a match was found (false).
 *                 matchedWord:
 *                   type: string
 *                   description: A message indicating that no match was found.
 *       204:
 *         description: The request body is missing required fields or has invalid data (e.g., a number for 'message').
 *         content:
 *           application/json:
 *             example:
 *               message: ''
 *     500:
 *       description: An error occurred while processing the request.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               err:
 *                 type: string
 *                 description: A description of the error.
 */

const automod = async (req, res) => {
	let { message, words } = req.body;
	try {
		if (!message || !words) {
			return res.status(204).json('');
		}
        if (typeof message == 'number'){
            return res.status(204).json('');
        }

		const wordsInMessage = message.toLowerCase().match(/\b\w+\b/g) || [];
		const modWords = words.toLowerCase().split(' ');

		let matchFound = false;
		let matchedWord = '';

		wordsInMessage.forEach((word) => {
			if (modWords.includes(word)) {
				matchFound = true;
				matchedWord += `${word} `;
			}
		});

		if (matchFound) {
			return res.status(200).json({ match: true, matchedWord: matchedWord.trim() });
		} else {
			return res.status(404).json({ match: false, matchedWord: 'No match found' });
		}
	} catch (err) {
		console.log('An error occurred', err);
		return res.status(500).json({ err });
	}
};

module.exports = automod;
