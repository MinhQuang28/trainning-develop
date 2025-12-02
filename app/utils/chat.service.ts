import ollama from "ollama";

export const shouldUseWebSearch = (prompt: string): boolean => {
    const lower = prompt.toLowerCase().trim();

    const searchKeywords = [
        "what is",
        "who is",
        "when is",
        "where is",
        "price of",
        "latest",
        "news",
        "update",
        "today",
        "real-time",
        "trending",
        "ollama",
        "model",
        "company",
        "search for",
        "tin tức",
        "giá",
        "sự kiện",
        "thời sự",
        "hôm nay",
        "tìm kiếm",
        "tìm thông tin về",
        "tìm trên trình duyệt",
        "là ai",
        "là gì",
        "ở đâu"
    ];

    const urlPattern = /(https?:\/\/[^\s]+)/i;
    if (urlPattern.test(prompt)) return true;

    const datePattern = /\b(202\d|202\d|203\d)\b/;
    if (datePattern.test(prompt) && lower.includes("khi nào")) return true;

    if (searchKeywords.some((kw) => lower.includes(kw))) {
        return true;
    }

    const factualHint = ["bao nhiêu", "tỷ lệ", "how many", "how much", "statistics", "company", "product"];

    if (factualHint.some((kw) => lower.includes(kw))) return true;

    return false;
};

export const generateAnswer = async (prompt: string, context: any) => {
    const contextPrompts = `
    You are an AI assistant embedded in an client app. Your purpose is to help the users by answering questions, providing suggestions, and offering relevant information based on the context of their previous messages.

    THE CURRENT TIME IS: ${new Date().toLocaleString()}

    -------------------- START CONTEXT --------------------
    ${context.map((ctx: any) => ctx?.text).join("\n")}
    CURRENT USER MESSAGE: ${prompt}
    --------------------- END CONTEXT ---------------------

    INSTRUCTIONS FOR RESPONSE:
    - Be helpful, clever, and articulate. 
    - Rely on your knowledge and the provided message context to inform your responses.
    - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information. 
    - Do not invent or speculate about anything that is not directly supported by the message context. 
    - Keep your responses concise and relevant to the user's questions or the message being composed.
    - If the prompt contain "WEB SEARCH RESULT" rely on its information to response and list the url where the information was founded.
    `;

    let webSearchResult = null;

    if (shouldUseWebSearch(prompt)) {
        webSearchResult = await ollama.webSearch({ query: "prompt" });
    }

    return await ollama.chat({
        model: process.env.OLLAMA_AI_MODEL as string,
        messages: [
            {
                role: "user",
                content:
                    contextPrompts +
                    (webSearchResult ? `\nWEB SEARCH RESULT: ${JSON.stringify(webSearchResult)}` : "")
            }
        ]
    });
};

export const generateTitle = async (firstPrompt: string) => {
    const prompt = `
    You are an AI that generates short conversation titles.

    Task:
    - Based on the following content: "${firstPrompt}"
    - Create a short title (maximum 5–8 words)
    - Do NOT add explanations.
    - Do NOT write full sentences.
    - Return ONLY the title.

    Return: the title only.
    `;

    const response = await ollama.chat({
        model: "gpt-oss:120b-cloud",
        messages: [{ role: "user", content: prompt }]
    });

    return response.message?.content?.trim() ?? "New Chat";
};
