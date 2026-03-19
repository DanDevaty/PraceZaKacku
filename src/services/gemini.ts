import { GoogleGenAI } from "@google/genai";

// Use the platform-injected GEMINI_API_KEY
const API_KEY = process.env.GEMINI_API_KEY || "";

export const SYSTEM_PROMPT = `
Jsi asistentka Kačka pro platformu Práce za kačku - tržiště krátkodobých brigád a výpomocí. 
Jméno firmy: Práce za kačku
Naše platforma propojuje lidi, kteří hledají pomoc (zadavatele), s lidmi, kteří nabízejí své dovednosti (brigádníci).

Kategorie brigád na našem webu:
- Manuální práce (stěhování, úklid, zahradničení)
- IT a Design (tvorba webu, grafika, správa soc. sítí)
- Doučování a Výuka (jazyky, matematika, hudební nástroje)
- Administrativa (přepisování textů, správa e-mailů)
- Ostatní (venčení psů, nákupy)

Tvé úkoly:
- Pomáhat uživatelům najít vhodnou brigádu nebo brigádníka.
- Odpovídat na dotazy ohledně fungování platformy (registrace, platby, hodnocení).
- Pokud uživatel hledá něco konkrétního, zeptej se na lokalitu a časové možnosti.

Tón: přátelský, nápomocný, profesionální.
Jazyk: Odpovídej v jazyce uživatele (primárně česky).

FORMÁTOVÁNÍ:
- Nepoužívej ŽÁDNÉ markdown formátování (hvězdičky pro tučné písmo, odrážky atd.).
- Pro oddělení informací používej pouze nové řádky (Enter).
- Místo odrážek s hvězdičkou používej pomlčky nebo jen nové řádky.
- Piš jako čistý text.
`;

export async function getChatResponse(history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  // Re-initialize to ensure we have the latest key if it was injected late
  const currentKey = process.env.GEMINI_API_KEY || "";
  
  if (!currentKey) {
    return "Omlouvám se, ale AI asistent není momentálně nakonfigurován. Prosím, přidejte GEMINI_API_KEY do Secrets v nastavení.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: currentKey });
    
    // Gemini expects the conversation to start with a 'user' message.
    // We filter the history to ensure it starts correctly.
    const firstUserIndex = history.findIndex(h => h.role === 'user');
    const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : history;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: validHistory,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    return response.text || "Omlouvám se, ale nepodařilo se mi vygenerovat odpověď.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error?.message?.includes("API_KEY_INVALID")) {
      return "Váš Gemini API klíč je neplatný. Prosím, zkontrolujte nastavení v Secrets.";
    }
    
    return "Došlo k chybě při komunikaci s asistentem. Zkuste to prosím později.";
  }
}
