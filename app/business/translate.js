const { getTextEmbeddings } = require("../modules/embeddings");
const { queryPinecone } = require("../modules/pinecone");

module.exports = {
  translate,
};

async function translate(from, to, text) {
  // 1- Embed the text
  let embeddedText = await getTextEmbeddings(text);
  // 2- Query the Pinecone database
  let translatedWord = await queryPinecone(embeddedText);

  return translatedWord;
}
