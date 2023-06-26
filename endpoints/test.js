// Non-functional test endpoint - don't bother.
const test = async (req, res) => {
    const { serverid, userid } = req.body;
    
    console.log(serverid);
    console.log(userid);
  
    res.json({ serverid, userid });
  };

  module.exports = test;