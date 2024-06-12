const mongoDB = require("mongodb");
const { v4: uuidv4 } = require("uuid");

let db = null;

module.exports = {
  connectMongoDB,
  mongoDB: db,
  insertTranslationMongoDB,
  getTranslations,
  wordExists,
};

async function wordExists(word) {
  const collection = db.collection("words");

  const result = await collection.findOne({
    word: word,
  });

  if (result) {
    return true;
  }

  return false;
}

async function connectMongoDB() {
  const client = new mongoDB.MongoClient(process.env.MONGO_DB_URL);

  await client.connect();

  db = client.db("translator");

  console.log("MongoDB - Connected");
}

async function insertTranslationMongoDB(word, translation, IPA) {
  const collection = db.collection("words");

  const result = await collection.insertOne({
    createAd: new Date(),
    uuid: uuidv4(),
    word,
    translation,
    IPA,
  });

  return result;
}

async function getTranslations(query = null) {
  let queryObj = {};

  if (query) {
    queryObj = {
      $or: [
        { word: { $regex: new RegExp(query, "i") } },
        { translation: { $regex: new RegExp(query, "i") } },
      ],
    };
  }

  const collection = db.collection("words");

  const result = await collection.find(queryObj).toArray();

  return result;
}
