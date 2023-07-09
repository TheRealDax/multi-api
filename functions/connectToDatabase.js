const { MongoClient } = require('mongodb');

const connectToDatabase = async (req) => {
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
  };

  module.exports = connectToDatabase;