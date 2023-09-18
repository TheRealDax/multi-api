const checkNum = async (req, res) => {
    const value = req.query.value;
    try{
        if (isNaN(value)) {
            res.status(200).json({ isNumber: false });
            return;
        }
        else{
            res.status(200).json({ isNumber: true });
            return;
        }
    }
    catch(err){
        console.error('Error:', err);
        return res.status(500).json({ error: `${err}` });
    }
};

module.exports = checkNum;