const { getTextEmbeddings } = require("../modules/embeddings");
const { insertTranslationMongoDB } = require("../modules/mongoDB");
const { insertPinecone } = require("../modules/pinecone");

module.exports = {
  insertTranslation,
};

async function insertTranslation(word, translation, IPA) {
  await insertTranslationMongoDB(word, translation, IPA);

  let wordEmbedding = await getTextEmbeddings(word);
  await insertPinecone(wordEmbedding, word, translation);
}
