// Non-functional test endpoint - don't bother.
const test = async (req, res) => {
    let { serverid, userid } = req.body;

    JSON.stringify({ serverid, userid });

    console.log(serverid);
    console.log(userid);
  
    // Perform operations on the serverIdString and userIdString values as needed
    
    res.json({ serverid, userid });
  };

  module.exports = test;