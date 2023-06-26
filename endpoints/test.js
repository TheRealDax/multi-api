// Non-functional test endpoint - don't bother.
const test = async (req, res) => {
    const { serverid, userid } = req.body;

    //const serverId = `${serverid}`;

    console.log(serverid);
    console.log(userid);
  
    // Perform operations on the serverIdString and userIdString values as needed
    
    res.json({ serverId, userid });
  };

  module.exports = test;