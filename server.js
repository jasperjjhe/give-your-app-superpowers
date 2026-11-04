// server.js: the backend for our meal idea generator.
//
// It does two jobs:
//   1. Sends the web page (the files in /public) to your browser.
//   2. Talks to the Gemini API. The API key stays HERE on the server,
//      so it never reaches the browser.
//
// Run it with:  npm start   then open http://localhost:3000

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { loadEnv } = require("./env");

loadEnv();

const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// The API endpoint: the address we send our request to.
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// ---------------------------------------------------------------------------
// TODO 1: Send the request to Gemini
// Slide: "A request in JavaScript". Replace each "___" below.
// ---------------------------------------------------------------------------
async function askGemini(prompt) {
  if (!apiKey || apiKey === "paste-your-key-here") {
    throw new Error("No API key yet. Copy .env.example to .env and paste your Gemini key into it.");
  }

  const response = await fetch(url, {
    method: "___", // Which HTTP method SENDS data? GET, POST, PUT or DELETE?
    headers: {
      "Content-Type": "application/json", // we're sending JSON
      "x-goog-api-key": "___"             // which variable holds your key? (no quotes!)
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  // -------------------------------------------------------------------------
  // TODO 2: Read the answer
  // Slides: "Why we parse" and "Reading the answer".
  // -------------------------------------------------------------------------
  if (!response.ok) {
    throw await geminiError(response);
  }
  const data = await response.___(); // turn the JSON text into a JavaScript object
  const answer = data.candidates?.[0]
    ?.content?.parts?.[0]?.text;
  if (!answer) {
    throw new Error("Gemini replied, but there was no text in the answer.");
  }
  return answer;
}

// ---------------------------------------------------------------------------
// TODO 3: Write a better dinner prompt
// Slide: "Prompting: be specific". Good prompt = context + task + constraints + format.
// Right now Gemini sends back a long essay. Try adding: who it's for, a time limit, how many steps, one swap,
// and the exact format you want back (see public/app.js, which reads "Meal:").
// ---------------------------------------------------------------------------
function buildPrompt(ingredients, minutes) {
  return `Suggest a meal using ${ingredients}.`;
}

// ---------------------------------------------------------------------------
// Everything below is wiring. You don't need to change it (but you can peek!).
// ---------------------------------------------------------------------------

// Turns an error response into a message that says whose side the problem is on.
async function geminiError(response) {
  let detail = "";
  try {
    const body = await response.json();
    detail = body.error?.message || "";
  } catch {
    // the error body wasn't JSON; that's fine
  }
  const status = response.status;
  let hint = "Something unexpected happened.";
  if (status >= 400 && status < 500) hint = "4xx = a problem on OUR side: check the method, key, URL or model name.";
  if (status === 429) hint = "429 = too many requests. Take a breath and try again in a minute.";
  if (status >= 500) hint = "5xx = a problem on GEMINI's side. Wait a moment and try again.";
  const error = new Error(`Gemini said ${status}. ${hint}${detail ? " Details: " + detail : ""}`);
  error.status = status;
  return error;
}

const PUBLIC_DIR = path.join(__dirname, "public");
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png" };

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10000) reject(new Error("That request is too big."));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("The request body wasn't valid JSON."));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // POST /api/meal  ->  ask Gemini for a meal idea
  if (req.method === "POST" && req.url === "/api/meal") {
    try {
      const { ingredients, minutes } = await readJsonBody(req);
      if (!ingredients || !String(ingredients).trim()) {
        return sendJson(res, 400, { error: "Add at least one ingredient first." });
      }
      const prompt = buildPrompt(String(ingredients).trim().slice(0, 300), Number(minutes) || 20);
      const meal = await askGemini(prompt);
      console.log("✅ Gemini answered!");
      return sendJson(res, 200, { meal });
    } catch (error) {
      console.error("❌", error.message);
      const status = error.status >= 500 ? 502 : 500;
      return sendJson(res, status, { error: error.message });
    }
  }

  // GET /anything  ->  send a file from the public folder
  if (req.method === "GET") {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);
    if (!filePath.startsWith(PUBLIC_DIR)) return sendJson(res, 403, { error: "Nope." });
    return fs.readFile(filePath, (err, content) => {
      if (err) return sendJson(res, 404, { error: "Not found" });
      res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] || "text/plain" });
      res.end(content);
    });
  }

  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`🍲 Meal idea generator running at http://localhost:${PORT}`);
  console.log(`   Using model: ${model}`);
  if (!apiKey || apiKey === "paste-your-key-here") {
    console.log("   ⚠️  No API key found yet. Copy .env.example to .env and add your key.");
  }
});
