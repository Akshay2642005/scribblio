import { Translate } from "@google-cloud/translate";
import dotenv from "dotenv";

dotenv.config();

const translate = new Translate({ key: process.env.GOOGLE_API_KEY });

export const translateText = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or target language" });
  }

  try {
    const [translation] = await translate.translate(text, targetLang);
    res.json({ translatedText: translation });
  } catch (error) {
    console.error("Translation Error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
};

