const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a helpful assistant in a Telegram bot. Keep replies concise and avoid unsupported formatting.",
});

async function askGemini(prompt, temperature = 0.7) {
    try {
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: prompt }],
            }],
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: temperature,
            }
        });

        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini API error:", error.message);
        return "❌ Sorry, I couldn't process that.";
    }
}

module.exports = askGemini;