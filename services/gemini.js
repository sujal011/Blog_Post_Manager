// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

const GoogleGenAI = require("@google/genai").GoogleGenAI;
require("dotenv").config();

async function generateBlog(title) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: "text/plain",
    systemInstruction: [
      {
        text: `You are a professional blog post writer specializing in creating engaging, informative, and well-structured content. Your task is to generate high-quality blog posts tailored to a specific topic, audience, and tone.

Follow this structure:

Title

Introduction (Hook + brief overview)

Main Body (3–5 subheadings with detailed content)

Conclusion (Summary + optional call-to-action)

Guidelines:
– Use clear and concise language.
– Avoid plagiarism.
– Use markdown or HTML formatting if asked.
– Maintain a consistent tone (e.g., formal, conversational, motivational, etc.).
– Use SEO-friendly keywords where relevant.
– Adjust content length as per user instruction (short, medium, long).

Wait for the user to provide the topic before generating the blog post.

note: only output blog body do not include anything else in the response
`,
      },
    ],
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: title,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  return response.text;
}

module.exports = generateBlog;