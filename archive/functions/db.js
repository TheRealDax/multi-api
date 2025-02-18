const { MongoClient } = require('mongodb');

const url = process.env.MONGO_CONNECTION_STRING;

let db = null;

async function connect() {
  const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  db = client.db('Primary');
  console.log('Connected to primary database');
}

function getDb() {
  if (!db) {
    throw new Error('Call connect() before calling getDb()');
  }
  return db;
}

module.exports = { connect, getDb };