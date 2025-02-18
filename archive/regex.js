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
 *                 result:
 *                   type: object
 *                   description: The matched string groups
 *                 match:
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

		if (string == undefined || regex == undefined) {
			res.status(400).json({ error: 'string and regex must be declared and have a value' });
			return;
		}
		
		const regexString = new RegExp(req.body.regex, 'gm');
		let matchedStrings;
		const responses = [];
    	let numMatches = 0;
    	let groups = [];

		while ((matchedStrings = regexString.exec(string)) !== null) {
			const matchedString = matchedStrings[0];
			const position = matchedStrings.index;

			// Capturing and handling groups
			const matchedGroups = matchedStrings.slice(1);
			if (matchedGroups.length > 0) {
				groups = matchedGroups;
			}
      numMatches++;
			responses.push({ matchedString, position, groups });
		}

		if (responses.length > 0) {
			return res.json({ result: responses, match: true, numMatches: numMatches });
		} else {
			return res.status(404).json({
				result: 'No match found. If you are having trouble, visit https://regex101.com/ to test your regular expression before trying again.',
				match: false,
			});
		}
	} catch (err) {
		console.error('Error:', err);
		return res.status(500).json({ error: `${err}` });
	}
};

module.exports = regex;
