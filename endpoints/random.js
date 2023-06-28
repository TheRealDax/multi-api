const random = async (req, res) => {
    const length = parseInt(req.query.length);
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

    res.send({ result });
    console.log(result);
};

module.exports = random;