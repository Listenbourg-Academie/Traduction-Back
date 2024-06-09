const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { connectPinecone } = require("./app/modules/pinecone");
const {
  connectMongoDB,
  getTranslations,
  wordExists,
} = require("./app/modules/mongoDB");
const { translate } = require("./app/business/translate");
const { insertTranslation } = require("./app/business/translation");

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://91.121.75.14:5500",
    ],
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
/**
 * Basic translator :
 * - 1 : Split the text into words
 * - 2 : For each word search it in the Pinecone database with similarity search
 * - 3 : Return the most similar word
 * - 4 : Rebuild the sentence with the translated words
 * - 5 : Return the response in the format :
 * {
 *   detail_reponse : [
 *    {
 *     word : "translated word",
 *    score : 1
 *   }
 * ]
 */
app.post("/translate", async (req, res) => {
  const { from, to, text } = req.body;

  // 1- Check if the required fields are present
  if (!from || !to || text === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 2- Split words
  let words = text.split(" ");
  words = words.map((word) => word.trim());

  let translatedWords = [];

  for (let word of words) {
    if (word.trim()) {
      let translation = await translate(from, to, word);
      translatedWords.push(translation);
    }
  }

  let translatedSentence = translatedWords.join(" ");
  // set sentence to lowercase just add uppercase at the first letter and after a dot
  translatedSentence = translatedSentence
    .toLowerCase()
    .replace(/(^\w{1})|(\.\s+\w{1})/gi, (letter) => {
      return letter.toUpperCase();
    });

  // 5- Return the response
  return res.json({
    detail_reponse: [
      {
        word: translatedSentence,
        score: 1,
      },
    ],
  });
});

app.post("/translation", async (req, res) => {
  const { word, translation, IPA } = req.body;

  let exists = await wordExists(word);

  if (exists || !word || !translation) {
    return res
      .status(400)
      .json({ success: false, status: 400, message: "Word already exists" });
  }

  await insertTranslation(word, translation, IPA);

  return res.json({ success: true, status: 200 });
});

app.get("/translation", async (req, res) => {
  let query = req.query.query;
  let words = await getTranslations(query);
  return res.json(words);
});

app.listen(5000, async () => {
  console.log("Server started on port 5000");

  await connectMongoDB();
  await connectPinecone();
});
