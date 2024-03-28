/**
 * @swagger
 * /timestamp:
 *   post:
 *     summary: Generate a UNIX timestamp based on a specific date and time OR days in the future
 *     tags: [Time]
 *     description: Generates a UNIX timestamp based on a specific date and time OR days in the future.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: The specific date (format&#58 DD/MM/YYYY)
 *                 example: 01/01/2023
 *               time:
 *                 type: string
 *                 description: The specific time (format&#58 HH:mm)
 *                 example: 12:00
 *               days:
 *                 type: integer
 *                 description: The number of days in the future
 *                 example: 7
 *               format:
 *                 type: string
 *                 description: The desired date/time format (options&#58 US, EU, ISO)
 *                 example: EU
 *               timestamp:
 *                 type: string
 *                 description: The specific timestamp (format&#58 DD-MM-YYYY HH&#58mm&#58ss)
 *                 example: 01-01-2023 12&#5800&#5800
 *               offset:
 *                 type: integer
 *                 description: The number of hours to offset the timestamp (positive or negative)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Successful request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 convertedTimestamp:
 *                   type: number
 *                   description: The generated UNIX timestamp
 *       400:
 *         description: Invalid request
 */

const moment = require('moment');

//generate a unix timestamp based on a specific date and time or days in the future
const timestamp = async (req, res) => {
	try {
		const { date, time = '00:00', days, format = 'EU', timestamp, offset } = req.body;

		let convertedTimestamp;

		if (date && time) {
			const datetime = `${date} ${time}`;
			const dateFormat = getDateFormat(format);
			convertedTimestamp = moment(datetime, dateFormat).unix();
		} else if (days) {
			const futureDate = moment().add(days, 'days');
			convertedTimestamp = futureDate.unix();
		} else if (!date && timestamp) {
			if (offset) {
				const offsetTimestamp = moment(timestamp).add(offset, 'hours');
				convertedTimestamp = offsetTimestamp.format('DD-MM-YYYY HH:mm:ss');
			} else {
				convertedTimestamp = moment.unix(timestamp).format('DD-MM-YYYY HH:mm:ss');
			}
		} else {
			return res.status(400).json({ error: 'Invalid request. Please provide either date and time or days parameter.' });
		}

		return res.status(200).json({ convertedTimestamp });
	} catch (err) {
		console.error('Error:', err);
		return res.status(500).json({ error: `${err}` });
	}
};

//funtion to decide the date/time format. Default is EU if format parameter is not passed.
function getDateFormat(format) {
	switch (format) {
		case 'US':
			return ['MM/DD/YYYY h:mmA', 'MM/DD/YYYY HH:mm'];
		case 'EU':
			return ['DD/MM/YYYY h:mmA', 'DD/MM/YYYY HH:mm'];
		case 'ISO':
			return ['YYYY-MM-DD HH:mm:ss'];
		default:
			return ['DD/MM/YYYY h:mmA', 'DD/MM/YYYY HH:mm'];
	}
}

module.exports = timestamp;
