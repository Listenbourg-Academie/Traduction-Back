const axios = require("axios");

module.exports = {
  getTextEmbeddings,
};

async function getTextEmbeddings(text) {
  const url = "https://api.jina.ai/v1/embeddings";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.EMBEDDINGS}`,
    },
  };

  const data = {
    input: [text],
    model: "jina-embeddings-v2-base-en",
    encoding_type: "float",
  };

  const response = await axios.post(url, data, options);

  let embeddings = response.data.data[0].embedding;
  return embeddings;
}
