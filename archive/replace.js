/**
 * @swagger
 * /replace:
 *   post:
 *     summary: Will replace any text that is enclosed in square brackets [ ].
 *     description: This endpoint replaces text that is enclosed in [ ] from the input string.
 *     tags: [String Manipulation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: string
 *                 description: The input string in which text will be replaced.
 *               replacewith:
 *                 type: string
 *                 description: The text to replace the matched pattern with.
 *             required:
 *               - input
 *     responses:
 *       200:
 *         description: Text replaced successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: The input string with text replaced.
 *                 match:
 *                   type: boolean
 *                   description: Indicates if any text was replaced (true).
 *       404:
 *         description: No match was found for the regular expression pattern.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: A message indicating that no match was found.
 *                 match:
 *                   type: boolean
 *                   description: Indicates that no text was replaced (false).
 *       500:
 *         description: An error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A description of the error.
 */

const replace = async (req, res) => {
	try {
		let input = req.body.input;
		const replacewith = req.body.replacewith || "";

        const regex = /\[[^\]]+\]/g;

        input = input.replace(regex, replacewith);

		if (input.length > 0) {
			return res.json({ result: input.trim(), match: true });
		} else {
			return res.status(404).json({
				result: 'No match found.',
				match: false,
			});
		}
	} catch (err) {
		console.error('Error:', err);
		return res.status(500).json({ error: `${err}` });
	}
};

module.exports = replace;