// Non-functional test endpoint - don't bother.
const test = async (req, res) => {
    const serverid = req.body.serverid.toString();
    const userid = req.body.userid.toString();

    console.log(serverid);
    console.log(userid);
  
    // Perform operations on the serverIdString and userIdString values as needed
    
    res.json({ serverid, userid });
  };

  module.exports = test;