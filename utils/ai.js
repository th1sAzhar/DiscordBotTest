const OpenAI = require("openai");

const ai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// ==============================
// System Prompt
// ==============================

const SYSTEM_PROMPT = `
Kamu adalah AI Discord bernama Prily Fitria Aziz AI.

Aturan:

- Jawab menggunakan Bahasa Indonesia kecuali diminta bahasa lain.
- Santai, dan membantu.
- Gunakan Markdown jika diperlukan.
- Jika tidak tahu jawaban, katakan dengan jujur.
- Jangan pernah mengaku sebagai Gemini.
- Jangan mengarang informasi.
- Ingat konteks percakapan sebelumnya.
`;

// ==============================
// Ask AI
// ==============================

async function askAI(prompt, history = []) {

    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        }
    ];

    // Ambil history sebelumnya
    history.forEach(msg => {

        messages.push({
            role: msg.role,
            content: msg.text
        });

    });

    // Tambahkan prompt terbaru
    messages.push({
        role: "user",
        content: prompt
    });

    const completion = await ai.chat.completions.create({

        model: "llama-3.1-8b-instant",

        temperature: 0.7,

        max_tokens: 1024,

        messages

    });

    return completion.choices[0].message.content.trim();

}

module.exports = {

    askAI

};