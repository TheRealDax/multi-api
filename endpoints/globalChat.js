const axios = require('axios');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

connectionString = process.env.MONGO_CONNECTION_STRING;
MongoClient.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true

  }).then(client => {
    console.log('Connected to Database');
    db = client.db('mainTestDB');
  });

const globalChat = async (req, res) => {
    const { register, token, createhook, serverid, execute, content, user, avatar, deletehook } = req.query;
    
    if (register && serverid) {
        const collections = await db.listCollections().toArray();
      
        for (let i = 0; i < collections.length; i++) {
          const collectionName = collections[i].name;
      
          const collection = db.collection(collectionName);
          const existingDocument = await collection.findOne({ server: serverid });
      
          if (existingDocument) {
            return res.status(200).send({ message: 'A token for this server already exists.', token: collectionName });
          }
        
        else if (!existingDocument){
            const mToken = crypto.randomBytes(8).toString('hex');
            const newCollection = db.collection(mToken);
    
            await newCollection.insertOne({ server: serverid });
          
            res.status(201).send({ message: 'Your token has been generated. You will need this token for ALL future requests, so please keep it safe.', mToken });
        }}

    }else if (register && !serverid){
        
        res.status(400).send({ message: 'You need to specify serverid when registering.' });

        } else if (token && !register) {
        const collections = await db.listCollections().toArray();
        const collectionExists = collections.some(collection => collection.name === token);
    
        if (collectionExists) {
            if (createhook && serverid) {
                const match = createhook.match(/https:\/\/discord\.com\/api\/webhooks\/(\d+)\/([a-zA-Z0-9_-]+)/);
                if (match) {
                  const wid = match[1];
                  const wtoken = match[2];
        
                  const collection = db.collection(token);
                const existingDocument = await collection.findOne({ sid: serverid });

                        if (existingDocument) {
                            res.status(400).send({ message: 'A webhook for this server ID already exists.' });
                        } else {

                        await collection.insertOne({ sid: serverid, wid, wtoken });
                
                        res.status(201).send({ message: 'Webhook created.' });
                        } 
                        }else {
                        res.status(400).send({ message: 'Invalid webhook URL.' });
                        }

                    } else if (deletehook && serverid) {
                        const match = deletehook.match(/https:\/\/discord\.com\/api\/webhooks\/(\d+)\/([a-zA-Z0-9_-]+)/);
                        if (match) {
                        const wid = match[1];
                        const wtoken = match[2];
                    
                        const collection = db.collection(token);
                        const existingDocument = await collection.findOne({ wid, wtoken });

                        if (!existingDocument) {
                            res.status(404).send({ message: 'This webhook does not exist.' });
                        } else {

                        await collection.deleteOne({ wid, wtoken });
                
                        res.status(200).send({ message: 'Webhook deleted.' });
                        } 
                        }else {
                        res.status(400).send({ message: 'Invalid webhook URL.' });
                        }

              } else if (execute && serverid && content && user && avatar) {
                const collection = db.collection(token);
                const documents = await collection.find({}).toArray();
        
                const filteredDocuments = documents.filter(document => document.sid !== serverid && !document.server);
                console.log(filteredDocuments);
        
                for (const document of filteredDocuments) {
                  const webhookUrl = `https://discord.com/api/webhooks/${document.wid}/${document.wtoken}`;
                  await axios.post(webhookUrl, { content: content, username: user, avatar_url: avatar });
                }
        
                res.status(200).send({ message: 'Messages sent.' });
              } else if (execute && !serverid || !content || !user || !avatar) {
                res.status(400).send({ message: 'The serverid, message, user and avatar parameters are required.' });
              } else {
                console.log ({ register, token, createhook, serverid, execute, content, user, avatar });
                res.status(500).send({ error: 'There was an error with your request. Please check your parameters and try again.' });
              }
            } else {
              res.status(400).send({ message: 'Token could not be found.' });
            }
          } else {
            res.status(400).send({ message: 'A token is required.' });
          }
        };

module.exports = globalChat;