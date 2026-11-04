// app.js runs in the BROWSER. It never sees your API key.
// It sends the ingredients to OUR server, and our server talks to Gemini.

const form = document.querySelector("#meal-form");
const button = document.querySelector("#submit");
const result = document.querySelector("#result");
const mealName = document.querySelector("#meal-name");
const mealText = document.querySelector("#meal-text");
const errorBox = document.querySelector("#error");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the page from reloading

  button.disabled = true;
  button.textContent = "Cooking up an idea…";
  result.hidden = true;
  errorBox.hidden = true;

  try {
    // POST = send data. We send JSON with the ingredients and the time.
    const response = await fetch("/api/meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: form.ingredients.value,
        minutes: form.minutes.value
      })
    });

    // The reply is JSON text, so we parse it into an object.
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    showMeal(data.meal);
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Give me an idea ✨";
  }
});

// If Gemini follows our format ("Meal: ..."), use that line as the heading.
function showMeal(text) {
  const clean = text.replace(/\*\*/g, "").trim();
  const match = clean.match(/^Meal:\s*(.+)$/m);
  mealName.textContent = match ? match[1] : "Here's an idea";
  mealText.textContent = match ? clean.replace(match[0], "").trim() : clean;
  result.hidden = false;
}
