import { useState } from 'react';

const menuDescriptions = {
  "Risotto ai funghi": "Rice, porcini mushrooms, parmesan. Creamy and aromatic.",
  "Tagliata di manzo": "Grilled beef with arugula and parmesan flakes. Gluten-free.",
  "Insalata mista": "Lettuce, tomatoes, and carrots. Light and vegan.",
  "Spaghetti alle vongole": "Spaghetti with fresh clams, garlic, and parsley.",
  "Lasagna classica": "Egg pasta, meat ragù, and béchamel sauce.",
  "Melanzane alla parmigiana": "Fried eggplants, tomato sauce, mozzarella. Gluten-free and vegetarian.",
  "Salmone alla griglia": "Grilled salmon fillet with herbs and lemon.",
  "Tofu saltato con verdure": "Tofu with zucchini, carrots, and peppers. Vegan.",
  "Zuppa di legumi": "Lentils, chickpeas, and mixed beans with celery and onion.",
  "Tiramisù": "Ladyfingers, coffee, mascarpone, and cocoa."
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
      model: "google/gemma-3-4b-it:free", #OR THE MODEL YOU  WANT
      messages: [
        {
          role: "system",
          content: `You are an AI assistant in a restaurant. The menu includes:\n${menuText}\n\n🎯 If the user asks for a recommendation, respond in card format:\n🥗 Recommended dish: ...\n📝 Description: ...\n🍷 Suggested wine: ...\n\n🧠 If the user asks about a dish, answer clearly. If a known dish is mentioned, you can still offer to add it to the order.`
        },
        ...conversationHistory
      ]
    })
  });

  const text = await response.text();
  console.log("🌐 Raw response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ JSON parsing error:", e);
    return null;
  }

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
      setOutput("❌ Error: No response received.");
      setPendingDishes([]);
      setPendingWine(null);
      return;
    }

    const newMessagesWithReply = [...newMessages, { role: "assistant", content: reply }];
    setMessages(newMessagesWithReply);

    const matches = reply.matchAll(/Recommended dish:\s*[*]*\**\s*(.*)/gi);
    const fromPrompt = Array.from(matches, m => m[1].trim().replace(/^\*+\s*/, ""));

    const wineMatch = reply.match(/Suggested wine:\s*(.*)/i);
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
      setOrderList(prev => [...prev, pendingWine + " (wine)"]);
      setPendingWine(null);
    }
  };

  const handleClearOrder = () => {
    setOrderList([]);
  };

  const handleSendOrder = () => {
    if (orderList.length === 0) return;
    alert("📤 Order sent:\n" + orderList.join(", "));
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Menu Assistant 🍽️</h1>

      <div>
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          placeholder="Type here, e.g., I am vegan or are the clams from the sea?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button onClick={handleSend} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>

      <div className="p-4 bg-white border rounded shadow space-y-2">
        <strong className="block text-lg">AI Response:</strong>
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
          <p className="text-gray-400 italic">No response yet</p>
        )}

        {(pendingDishes.length > 0 || pendingWine) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {[...new Set(pendingDishes)].map((dish, idx) => (
              <button
                key={idx}
                onClick={() => handleAddToOrder(dish)}
                className={`px-3 py-2 rounded text-white flex items-center gap-2 ${dish === mainDish ? 'bg-green-700' : 'bg-green-500'}`}
              >
                {dish === mainDish && '⭐'} ✅ Add “{dish}”
              </button>
            ))}
            {pendingWine && (
              <button
                onClick={handleAddWine}
                className="bg-yellow-600 text-white px-3 py-2 rounded"
              >
                🍷 Add “{pendingWine}”
              </button>
            )}
          </div>
        )}
      </div>

      {orderList.length > 0 && (
        <div className="p-4 bg-white border rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🧾 Current Order:</h2>
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
              🧹 Clear Order
            </button>
            <button
              onClick={handleSendOrder}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              📤 Submit Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
