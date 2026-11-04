# Give Your App Superpowers! 🍲✨

Starter repo for the **HackCamp 2026 AI APIs workshop** by nwPlus.

You'll build a tiny **meal idea generator**: type the ingredients in your fridge, and the Gemini API suggests a dinner.
It's plain **HTML, CSS and JavaScript** in the browser, plus a small **Node.js** server that keeps your API key secret.

```
Browser (public/)  --POST /api/meal-->  Server (server.js)  --POST-->  Gemini API
   shows the meal  <------ JSON -------   builds the prompt  <-- JSON --  writes the idea
```

## Before the workshop

- A GitHub account, signed in
- [Git](https://git-scm.com/downloads) or [GitHub Desktop](https://desktop.github.com/)
- [Node.js](https://nodejs.org) (the **LTS** version)
- [VS Code](https://code.visualstudio.com/) and a browser
- A Google account (for [Google AI Studio](https://aistudio.google.com))

## 1. Fork and clone

1. Click **Fork** (top right of this page). Now you have your own copy on GitHub.
2. Clone **your fork** to your laptop:
   - GitHub Desktop: **File → Clone repository** and pick your fork, or
   - Terminal: `git clone https://github.com/YOUR-USERNAME/give-your-app-superpowers.git`
3. Open the folder in VS Code.

No `npm install` needed: this project has zero dependencies.

## 2. Add your Gemini key

1. Create a free key at **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**.
2. Copy `.env.example` and rename the copy to `.env`.
3. Paste your key after `GEMINI_API_KEY=`.
4. Check everything works:

```bash
npm run check
```

> 🔐 **Your API key is like a password.** It lives only in `.env`, which is listed in `.gitignore`, so Git won't upload it. Never paste it into `public/` files: anything in the browser can be seen by anyone. If it leaks, delete it in AI Studio and make a new one.

## 3. Run the app

```bash
npm start
```

Open **http://localhost:3000**. Until you finish TODO 1, the app will show an error. That's expected! Stop the server with `Ctrl + C` (restart it after every change to `server.js`).

## 4. Workshop TODOs (all in `server.js`)

| TODO | What you do | Slide |
| --- | --- | --- |
| 1 | Fill in the `___` blanks to send the request | A request in JavaScript |
| 2 | Fill in the blank to parse the response | Why we parse / Reading the answer |
| 3 | Write a better dinner prompt in `buildPrompt()` | Prompting: be specific |

Stuck? The finished version is in [`solution/server.js`](solution/server.js) (try it with `npm run solution`).

## HTTP status codes, decoded

| Code | Means | Try this |
| --- | --- | --- |
| **2xx** | ✅ Success (`200 OK`) | Celebrate |
| **4xx** | 🙋 Something on **our** side | `400` check the request · `403` check your key · `404` check the URL/model · `429` too many requests, wait a minute |
| **5xx** | 🔥 Something on **Gemini's** side | Wait a moment and try again |

## 5. Make it yours

Change one thing:

- Add dietary preferences (vegetarian, halal, no nuts…)
- Ask for a grocery list
- Ask for JSON and display it in a fancier UI
- Swap the whole idea: a hackathon idea generator, a study buddy, a pun machine…

Commit and push your changes to your fork to show them off!

## Files

```
public/index.html   the page
public/style.css    the looks
public/app.js       browser code: sends ingredients to our server
server.js           server code: builds the prompt, calls Gemini  ← your TODOs
env.js              reads your .env file
check-setup.js      npm run check
solution/server.js  the finished server.js
```

Made with 💛 by nwPlus for HackCamp 2026. Model: `gemini-3.5-flash-lite` on the Gemini API free tier (change it in `.env`).
