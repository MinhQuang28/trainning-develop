import ollama from "ollama";
const model = "glm-4.6:cloud";


export async function Ollama(content: string) {
  return await ollama.chat({
    model,
    messages: [{ role: "user", content }],
  });
}

