import { useState } from 'react';

const menuDescriptions = {
  "Risotto ai funghi": "Riso, funghi porcini, parmigiano. Cremoso e aromatico.",
  "Tagliata di manzo": "Manzo grigliato con rucola e scaglie di grana. Senza glutine.",
  "Insalata mista": "Lattuga, pomodori e carote. Leggera e vegana.",
  "Spaghetti alle vongole": "Spaghetti con vongole fresche, aglio e prezzemolo.",
  "Lasagna classica": "Pasta all'uovo, ragù di carne e besciamella.",
  "Melanzane alla parmigiana": "Melanzane fritte, salsa di pomodoro, mozzarella. Senza glutine e vegetariano.",
  "Salmone alla griglia": "Filetto di salmone con erbe aromatiche e limone.",
  "Tofu saltato con verdure": "Tofu con zucchine, carote e peperoni. Vegano.",
  "Zuppa di legumi": "Lenticchie, ceci e fagioli misti con sedano e cipolla.",
  "Tiramisù": "Savoiardi, caffè, mascarpone e cacao."
};

async function askOpenRouter(conversationHistory) {
  const menuText = Object.entries(menuDescriptions)
    .map(([name, desc]) => `- ${name}: ${desc}`)
    .join("\n");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemma-3-4b-it:free",
      messages: [
        {
          role: "system",
          content: `Sei un assistente AI in un ristorante. Il menù include:\n${menuText}\n\n🎯 Se l'utente chiede un consiglio, rispondi in formato scheda:\n🥗 Piatto consigliato: ...\n📝 Descrizione: ...\n🍷 Vino suggerito: ...\n\n🧠 Se l'utente fa domande su un piatto, rispondi chiaramente. Se riconosci un piatto, puoi comunque offrire la possibilità di aggiungerlo alla comanda.`
        },
        ...conversationHistory
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

export default function MenuChat() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [pendingDishes, setPendingDishes] = useState([]);
  const [mainDish, setMainDish] = useState(null);
  const [pendingWine, setPendingWine] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!input) return;

    const newMessages = [...messages, { role: "user", content: input }];
    const reply = await askOpenRouter(newMessages);

    if (!reply) {
      setOutput("❌ Errore: nessuna risposta ricevuta.");
      setPendingDishes([]);
      setPendingWine(null);
      return;
    }

    const newMessagesWithReply = [...newMessages, { role: "assistant", content: reply }];
    setMessages(newMessagesWithReply);

    const matches = reply.matchAll(/Piatto consigliato:\s*[*]*\**\s*(.*)/gi);
    const fromPrompt = Array.from(matches, m => m[1].trim().replace(/^\*+\s*/, ""));

    const wineMatch = reply.match(/Vino suggerito:\s*(.*)/i);
    const wine = wineMatch ? wineMatch[1].trim() : null;

    const mentionedInText = Object.keys(menuDescriptions).filter(item =>
      reply.toLowerCase().includes(item.toLowerCase())
    );

    const allSuggested = Array.from(new Set([...fromPrompt, ...mentionedInText]));

    setMainDish(fromPrompt[0] || null);
    setPendingDishes(allSuggested);
    setPendingWine(wine);
    setOutput(reply.trim());
    setInput("");
  };

  const handleAddToOrder = (dish) => {
    setOrderList(prev => [...prev, dish]);
  };

  const handleAddWine = () => {
    if (pendingWine) {
      setOrderList(prev => [...prev, pendingWine + " (vino)"]);
      setPendingWine(null);
    }
  };

  const handleClearOrder = () => {
    setOrderList([]);
  };

  const handleSendOrder = () => {
    if (orderList.length === 0) return;
    alert("📤 Comanda inviata:\n" + orderList.join(", "));
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Consulente AI 🍽️ - Osteria Fede</h1>

      <div>
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          placeholder="Scrivi qui, es: sono vegano o le vongole sono di mare?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button onClick={handleSend} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
          Invia
        </button>
      </div>

      <div className="p-4 bg-white border rounded shadow space-y-2">
        <strong className="block text-lg">Risposta AI:</strong>
        {output ? (
          <>
            {output.split("\n").map((line, idx) => {
              const isExtra = !line.startsWith("🥗") && !line.startsWith("📝") && !line.startsWith("🍷") && line.trim() !== "";
              return (
                <p
                  key={idx}
                  className={isExtra ? "bg-yellow-100 border-l-4 border-yellow-500 pl-2 pr-2 py-1 rounded text-sm" : "text-gray-800"}
                >
                  {isExtra ? `📢 ${line}` : line}
                </p>
              );
            })}
          </>
        ) : (
          <p className="text-gray-400 italic">Nessuna risposta ancora</p>
        )}

        {(pendingDishes.length > 0 || pendingWine) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {[...new Set(pendingDishes)].map((dish, idx) => (
              <button
                key={idx}
                onClick={() => handleAddToOrder(dish)}
                className={`px-3 py-2 rounded text-white flex items-center gap-2 ${dish === mainDish ? 'bg-green-700' : 'bg-green-500'}`}
              >
                {dish === mainDish && '⭐'} ✅ Aggiungi “{dish}”
              </button>
            ))}
            {pendingWine && (
              <button
                onClick={handleAddWine}
                className="bg-yellow-600 text-white px-3 py-2 rounded"
              >
                🍷 Aggiungi “{pendingWine}”
              </button>
            )}
          </div>
        )}
      </div>

      {orderList.length > 0 && (
        <div className="p-4 bg-white border rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🧾 Comanda attuale:</h2>
          <ul className="list-disc pl-5 space-y-1">
            {orderList.map((dish, idx) => (
              <li key={idx}>{dish}</li>
            ))}
          </ul>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleClearOrder}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              🧹 Svuota comanda
            </button>
            <button
              onClick={handleSendOrder}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              📤 Invia comanda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
