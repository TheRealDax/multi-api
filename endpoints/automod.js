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
