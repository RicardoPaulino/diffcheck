import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API endpoint to suggest improvements
app.post("/api/suggest-improvements", async (req, res) => {
  try {
    const { textA, textB } = req.body;
    if (!textA || !textB) {
      return res.status(400).json({ error: "Os textos A e B são obrigatórios para a análise." });
    }

    const systemInstruction = `Você é um refinador de escrita e assistente editorial especializado em analisar e sugerir melhorias de texto.
      O usuário está comparando o Texto A (Original) e o Texto B (Modificado). Suas melhorias devem ser baseadas no Texto B mas considerando as diferenças em relação ao Texto A.
      Responda estritamente em JSON estruturado com o seguinte schema:
      {
        "suggestions": [
          {
            "original_fragment": "trecho exato do Texto B a ser melhorado",
            "suggested_fragment": "o trecho sugerido melhorado",
            "explanation": "explicação curta do porquê melhorar esse trecho"
          }
        ],
        "general_advice": "conselho geral de revisão focado na coesão, gramática, legibilidade e polimento de fluxo"
      }
      Garanta que o JSON retornado seja válido e bem formatado. A resposta deve focar em refinamento, precisão vocabular, coesão, gramática e estilo harmônico em português.`;

    const prompt = `Analise o Texto A (Original) e o Texto B (Modificado) fornecidos abaixo:
    
    TEXTO A (Original):
    """
    ${textA}
    """
    
    TEXTO B (Modificado):
    """
    ${textB}
    """
    
    Sugira refinamentos de escrita específicos no Texto B tomando o Texto A como base de intenção inicial.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao chamar o Gemini." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
