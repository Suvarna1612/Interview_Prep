const {
  GoogleGenerativeAI
} = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();
const {
  conceptExplainPrompt,
  questionAnswerPrompt
} = require('../utils/prompt.js');
const ai = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});
const generateInterviewQuestions = async (req, res) => {
  try {
    const {
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    } = req.body;
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }
    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt
    });
    let rawText = response.text;
    const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return res.status(500).json({
        message: "Invalid JSON format in AI response"
      });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message
    });
  }
};
const generateConceptExplanation = async (req, res) => {
  try {
    const {
      question
    } = req.body;
    if (!question) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }
    const prompt = conceptExplainPrompt(question);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt
    });
    let rawText = response.text;
    const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return res.status(500).json({
        message: "Invalid JSON format in AI response"
      });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message
    });
  }
};
module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation
};