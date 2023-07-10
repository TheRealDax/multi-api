const { MongoClient } = require('mongodb');
const connectionString = process.env.MONGO_CONNECTION_STRING;

let _db = {};

async function connectDB(mDB, retries = 3){
  if (!_db[mDB]){
    try {
      const client = await MongoClient.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

    await client.connect();
    _db[mDB] = client;
    console.log(`Connected to Database ${mDB}`);

  } catch (err) {
    console.error('Failed to connect to the database:', err);

    if (retries === 0){
      process.exit(1);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** (5 - retries)));
      await connectDB(mDB, retries - 1);
      }
    }
  }
  return _db[mDB].db(mDB);
};

async function getDB(mDB) {
  if (!_db[mDB]) {
    console.log(`There is no established database connection for ${mDB}. Connecting...`);
    await connectDB(mDB);
  }
  return _db[mDB].db(mDB);
}

// old version
/* const connectToDatabase = async (req) => {
    try {
      const connectionString = process.env.MONGO_CONNECTION_STRING;
      const client = await MongoClient.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      const db = client.db(`${req}`);
      console.log(`Connected to Database ${req}`);
      return db;
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      throw error;
    }
  }; */

  module.exports = { connectDB, getDB};