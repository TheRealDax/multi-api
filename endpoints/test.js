// Non-functional test endpoint - don't bother.
const test = async (req, res) => {
    const { serverid, userid } = req.body;
    
    const serverIdString = String(serverid);
    const userIdString = String(userid);
    
    console.log(serverIdString);
    console.log(userIdString);
  
    // Perform operations on the serverIdString and userIdString values as needed
    
    res.json({ serverid: serverIdString, userid: userIdString });
  };

  module.exports = test;