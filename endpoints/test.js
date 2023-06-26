// Non-functional test endpoint - don't bother.
const test = async (req, res) => {
    const { serverid, userid } = req.body;
    
    const payload = { serverid: `${serverid}`, userid: `${userid}` }

    console.log(serverid);
    console.log(userid);

  
    res.json({ payload });
  };

  module.exports = test;