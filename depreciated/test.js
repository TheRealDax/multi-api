// Non-functional test endpoint - don't bother.
const test = async (req, res) => {
    let { serverid, userid } = req.body;

    if(typeof serverid == "number" || typeof userid == "number"){
        res.status(400).json({ error: "You have not enclosed the id variables in \"\" (quotes) in value." });
    }

    console.log(serverid);
    console.log(userid);
    
    res.json({ serverid, userid });
  };

  module.exports = test;