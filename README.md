# Universal AI Translator 🌐

A premium, modern, and highly responsive **AI-Powered Translator Web Application** built with a **React + TypeScript + Tailwind CSS v4** frontend and a **Node.js + Express** backend integrated with the **OpenAI API**.

It supports real-time debounce translation, automatic source language detection, customizable translation tones, dark/light theme toggle, translation history, and copying/clearing inputs.

---

## Features ✨

*   **AI-Powered Translations**: Uses OpenAI's `gpt-4o-mini` model to provide accurate, natural, and layout-preserving translations.
*   **Auto-Detect Source Language**: Detects the input language automatically if selected.
*   **Tone Customization**: Adjust translation styles (e.g., Casual, Formal, Professional, Poetic, or Humorous).
*   **Real-time & Manual Modes**: Translates automatically 1.2s after you stop typing, or by clicking the **Translate Now** button.
*   **Premium Glassmorphism UI**: Beautiful, fully responsive layout built with the brand-new Tailwind CSS v4, supporting subtle radial glows, blur panels, and micro-animations.
*   **Dark & Light Theme**: Seamlessly switches themes and persists user preference in `localStorage`.
*   **Translation History**: Local history manager showing past language pairs, inputs, outputs, and tones. Allows restoring a past translation to active editor fields, copying output, or deleting entries.
*   **Quick Actions**: Standard Copy to Clipboard (with success toast notices) and Clear Text buttons.
*   **Connection Monitor**: Visual health indicator displaying backend server connectivity state in real time.

---

## Directory Structure 📂

```text
ai-translator-app/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI Sub-components (ThemeToggle, LanguageDropdown, History)
│   │   ├── types.ts        # TypeScript declarations
│   │   ├── App.tsx         # Main dashboard page
│   │   ├── main.tsx        # React entrypoint
│   │   └── index.css       # Main styles & Tailwind v4 directive
│   ├── vite.config.ts      # Vite dev settings & backend api proxy config
│   └── package.json
│
├── server/                 # Node.js Express Backend
│   ├── src/
│   │   └── server.ts       # Express router, OpenAI controller, health monitor
│   ├── .env                # Env variables (Port, API Key) - GIT IGNORED
│   ├── .env.example        # Reference environment variables
│   └── package.json
│
├── package.json            # Root configuration for concurrent execution
└── README.md               # Setup Guide
```

---

## Prerequisites ⚙️

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   An [OpenAI API Key](https://platform.openai.com/api-keys)

---

## Installation & Setup 🚀

### 1. Set Up the Backend Environment
Navigate to the `server` directory, duplicate the environment file, and add your OpenAI API Key:

```bash
# Locate and copy environment file
cp server/.env.example server/.env
```

Open `server/.env` and replace `your_openai_api_key_here` with your actual OpenAI API Key:
```text
PORT=5000
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Install Dependencies
You can install dependencies for both the frontend (`client`) and backend (`server`), along with root dev-tools, with a single command from the project root directory:

```bash
npm run install:all
```

Alternatively, you can run `npm install` inside both the `client` and `server` folders individually.

---

## Running the Application 💻

To run the entire application (both frontend and backend) simultaneously, execute the following command in the project root folder:

```bash
npm run dev
```

This runs:
*   **Express Backend**: [http://localhost:5000](http://localhost:5000)
*   **Vite Frontend Client**: [http://localhost:3000](http://localhost:3000) (with proxying configured to pipe API requests to the backend)

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to start translating!

---

## Technical Details & AI Prompt 🧠

The translator utilizes a fine-tuned system prompt designed to restrict OpenAI's response to the raw translation only. This ensures seamless parsing:
1.  **Direct Delivery**: The AI is instructed to return *only* the translated text, omitting introductory phrases ("Here is the translation:") or code block wraps.
2.  **Structural Integrity**: Layout, emojis, punctuation, capitalization, and paragraphs are preserved exactly.
3.  **Refined Tone**: The tone modifier instructs the LLM to rewrite and format output matching selected tones (e.g., Casual, Poetic).
