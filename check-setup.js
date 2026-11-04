// Checks that your laptop is ready for the workshop.
// Run it with:  npm run check

const fs = require("node:fs");
const path = require("node:path");
const { loadEnv } = require("./env");

const ok = (msg) => console.log("✅ " + msg);
const bad = (msg) => console.log("❌ " + msg);

async function main() {
  console.log("\nChecking your setup...\n");
  let ready = true;

  const major = Number(process.versions.node.split(".")[0]);
  if (major >= 18) ok(`Node.js ${process.versions.node}`);
  else { bad(`Node.js ${process.versions.node} is too old. Install the LTS version from https://nodejs.org`); ready = false; }

  const ignored = fs.existsSync(path.join(__dirname, ".gitignore")) &&
    fs.readFileSync(path.join(__dirname, ".gitignore"), "utf8").split(/\r?\n/).includes(".env");
  if (ignored) ok(".env is listed in .gitignore, so your key won't be committed");
  else { bad("Add .env to your .gitignore file!"); ready = false; }

  if (!loadEnv()) {
    bad("No .env file yet. Copy .env.example, rename the copy to .env, and paste your key in.");
    return finish(false);
  }
  ok("Found your .env file");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "paste-your-key-here") {
    bad("GEMINI_API_KEY is empty. Get a key at https://aistudio.google.com/apikey");
    return finish(false);
  }
  ok("Found GEMINI_API_KEY");

  // A GET request: we're only READING information about the model, not sending a prompt.
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}`, {
    method: "GET",
    headers: { "x-goog-api-key": apiKey }
  });

  if (response.ok) ok(`Gemini says ${response.status}: your key works with ${model} 🎉`);
  else {
    ready = false;
    if (response.status >= 500) bad(`Gemini says ${response.status}: a problem on Google's side. Try again in a minute.`);
    else bad(`Gemini says ${response.status}: check that you copied the whole key, and the model name "${model}".`);
  }
  finish(ready);
}

function finish(ready) {
  console.log(ready ? "\nYou're ready! Run: npm start\n" : "\nFix the ❌ above, then run: npm run check\n");
}

main().catch((error) => {
  bad("Couldn't reach Gemini: " + error.message + " (are you online?)");
});
