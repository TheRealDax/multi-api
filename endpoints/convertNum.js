/**
 * @swagger
 * /convertnum:
 *   get:
 *     summary: Converts numbers from full to shortened or shortened to full
 *     tags: [Number Manipulation]
 *     description: Converts numbers from full to short format or vice versa, e.g., 1000 = 1k OR 1k = 1000
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: number
 *         description: The number to convert, can be a normal number or a number with suffix (k, m, b, t)
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: 1000
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
 *                   description: The converted number, can be a normal number or a number with suffix (k, m, b, t)
 *       400:
 *         description: Missing or invalid number
 */

//converts numbers from full to short or vice versa, eg: 1000 = 1k OR 1k = 1000
const convertNum = async (req, res) => {
	try {
		if (!req.query || req.query.number === undefined) {
			return res.status(400).json({ error: 'number not specified' });
		}

		const { number } = req.query;

		if (isNaN(number) && !number.toLowerCase().match(/[kmbt]$/)) {
			return res.status(400).json({ error: 'Invalid number or unsupported string format' });
		}

		// Conversion from number to shortened format
		if (!isNaN(number)) {
			const num = parseFloat(number);
			let result = number;

			if (num >= 1000000000000) {
				if (num % 10 === 0) {
					result = Math.floor(num / 100000000) / 10000 + 't';
				} else {
					result = (num / 1000000000000).toFixed(2) + 't';
				}
			} else if (num >= 1000000000) {
				if (num % 10 === 0) {
					result = Math.floor(num / 1000000) / 1000 + 'b';
				} else {
					result = (num / 1000000000).toFixed(2) + 'b';
				}
			} else if (num >= 1000000) {
				if (num % 10 === 0) {
					result = Math.floor(num / 10000) / 100 + 'm';
				} else {
					result = (num / 1000000).toFixed(2) + 'm';
				}
			} else if (num >= 1000) {
				if (num % 1 === 0) {
					result = num / 1000 + 'k';
				} else {
					result = (num / 1000).toFixed(2) + 'k';
				}
			}

			return res.status(200).json({ result });
		}

		// Conversion from shortened format to number
		else {
			const numStr = number.toLowerCase();
			let result = number;

			if (numStr.endsWith('t')) {
				result = parseFloat(numStr) * 1000000000000;
			} else if (numStr.endsWith('b')) {
				result = parseFloat(numStr) * 1000000000;
			} else if (numStr.endsWith('m')) {
				result = parseFloat(numStr) * 1000000;
			} else if (numStr.endsWith('k')) {
				result = parseFloat(numStr) * 1000;
			}

			return res.status(200).json({ result });
		}
	} catch (err) {
		console.error('Error:', err);
		return res.status(500).json({ error: `${err}` });
	}
};

module.exports = convertNum;
