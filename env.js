// Reads the key=value lines in .env into process.env.
// (A tiny version of the popular "dotenv" package, so you don't need to install anything.)
const fs = require("node:fs");
const path = require("node:path");

function loadEnv() {
  const file = path.join(__dirname, ".env");
  if (!fs.existsSync(file)) return false;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue; // skip blank lines and # comments

    let value = match[2];
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1); // remove quotes
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
  return true;
}

module.exports = { loadEnv };
