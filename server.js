import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { checkEnvironment } from "./utils.js";
import 'dotenv/config';

checkEnvironment();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  // dangerouslyAllowBrowser: true, 
});

app.post("/translate", async (req, res) => {

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let translatedText = "";
    const { text, targetLanguage } = req.body;

    // Initialize messages array with system prompt
    const messages = [
      {
        role: "system",
        content: `You are a translation assistant. 
        You will be given sentences in any language, 
        and your task is to translate it into the target language specified by the user.
        The target language is ${targetLanguage}.
        Please provide only the translated text without any additional explanations 
        or formatting and your translation should be under 272 characters. 
        If the translation exceeds this limit, please truncate it to fit within the limit 
        while maintaining the meaning as much as possible.
        In the translation headline, please include the name of the target language and name of the source language in parentheses.
         For example, if the target language is Spanish and the source language is English, the headline should be "Source(English) --> Translation (Spanish):". 
         and if the target language is Japanese and the source language is English, the headline should be "Source(English) --> Translation (Japanese):". 
         Please ensure that the headline is included at the beginning of your response, followed by the translated text.`,
      },
    ];

    // Add user message to the conversation
    messages.push({ role: "user", content: text });

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: messages,
      stream: true,
      max_completion_tokens: 105,
      temperature: 0.5,
    });

    // Extract the translated text from the API response
    for await (const part of response) {
      if (part.choices && part.choices[0] && part.choices[0].delta) {
        console.log("Received part:", part.choices[0].delta.content);
        const deltaContent = part.choices[0].delta.content;
    
        res.write(`${deltaContent}`);
      }
    }

    
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).json({ error: "Failed to translate text" });
  }
});

const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
 });