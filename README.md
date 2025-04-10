# ai-restaurant-menu-chatbot
AI Menu Assistant 🍽️ — Smart menu suggestions with OpenRouter &amp; React
# 🍽️ AI Menu Assistant

An intelligent, React-based virtual assistant that helps restaurant guests explore the menu and get dish & wine suggestions in real time — powered by OpenRouter AI.

> Scan a QR code at your table and ask: “I’m vegan, what do you recommend?” — and get a friendly, tailored answer with an optional wine pairing.

---

## ✨ Features

- 💬 Chat-based menu interaction
- 🧠 AI-generated dish suggestions with ingredient awareness
- 🍷 Smart wine pairings for each plate
- 🛒 Add dishes and wines to your **virtual order list**
- 📋 Includes dietary tags: vegetarian, vegan, gluten-free, etc.
- ⚡ Built with **React** and powered by **OpenRouter**

---

## 🖼️ Demo

![Screenshot](https://github.com/user-attachments/assets/c6c73f76-66c7-45b1-8c6c-725cb15af6ff)

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/ai-menu-assistant.git
cd ai-menu-assistant
```
### Install dependencies
```bash
npm install
```
### Create .env file
```bash
VITE_OPENROUTER_API_KEY=sk-xxxxxxx
```
You can get a free API key at https://openrouter.ai
Be aware of the daily free quota for certain models.

### Start the app
```bash
npm run dev -- --host
```
Visit the app on your local network (or use ngrok/public server for QR code testing in real restaurants)

---

## 🧠 How It Works

1. The user enters a request  
   _e.g., "I'm vegan" or "Are the vongole from the sea?"_

2. The assistant uses **OpenRouter** to match user preferences with your menu

3. The response includes:
   - ✅ **Suggested dish** (displayed in a clean emoji card)
   - 🍷 **Wine pairing**
   - 📢 **Extra info**, such as ingredients or allergens

4. The user can then **add items to their virtual order**

---

## 💡 Use Case Ideas

- 📱 Place a **QR code** on each table in your restaurant
- 🧾 Let customers interact with your menu — _no app required_
- 🖥️ Offer a **kiosk or tablet version** at the entrance
- 🌍 Add multilingual support for tourists _(coming soon)_

---

## 🧑‍🍳 Future Features

- 🌍 **Multilingual support** (🇮🇹 🇬🇧 🇫🇷 🇪🇸)
- 🔄 Integration with POS systems or WhatsApp
- 📊 **Analytics** on customer choices and popular dishes
- 👨‍🍳 Daily or seasonal **chef specials**
- 🪄 Voice-based ordering interface (experimental)

---

## 🙌 Credits

Made with ❤️ by G.
Inspired by the future of human-AI collaboration in hospitality.

---

## 📢 Feedback & Contributions

Pull requests welcome!  
If you like the project, **⭐️ star it** and share it on Twitter/X!
