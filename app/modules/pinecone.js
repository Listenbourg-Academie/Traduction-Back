const { Pinecone } = require("@pinecone-database/pinecone");

module.exports = {
  connectPinecone,
  queryPinecone,
  insertPinecone,
};

let pc = null;
let index = null;

async function connectPinecone() {
  pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  index = await pc.index(process.env.PINECONE_INDEX_NAME);

  console.log("Pinecone - Connected");
}

async function queryPinecone(embedding) {
  const response = await index.query({
    vector: embedding,
    topK: 3,
    includeMetadata: true,
  });

  let word = response.matches[0];

  return word.metadata.translation;
}

async function insertPinecone(embedding, word, translation) {
  // word is a metadata field
  const response = await index.upsert([
    {
      id: word,
      values: embedding,
      metadata: {
        word,
        translation,
      },
    },
  ]);

  console.log("Pinecone - Inserted word:", word);
}
